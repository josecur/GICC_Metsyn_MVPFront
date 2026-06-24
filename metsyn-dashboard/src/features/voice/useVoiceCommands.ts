import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUiStore } from "@/shared/store/useUiStore"

export type VoiceStatus = "idle" | "listening" | "processing" | "error" | "unsupported"

interface CommandResult {
  status: VoiceStatus
  transcript: string
  lastCommand: string | null
  supported: boolean
  start: () => void
  stop: () => void
}

/** v1: solo navegación + tema. Los filtros (v2) se enchufarán aquí reusando Zustand. */
interface Command {
  keywords: string[]
  run: () => void
  feedback: string
}

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g")
const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(DIACRITICS, "").trim()

// Tipos mínimos de Web Speech API (no están en lib.dom por defecto)
type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

export function useVoiceCommands(): CommandResult {
  const navigate = useNavigate()
  const setTheme = useUiStore((s) => s.setTheme)
  const setVoiceOpen = useUiStore((s) => s.setVoiceOpen)

  const [status, setStatus] = useState<VoiceStatus>("idle")
  const [transcript, setTranscript] = useState("")
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const SpeechRecognition =
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : undefined
  const supported = Boolean(SpeechRecognition)

  const commands: Command[] = [
    { keywords: ["dashboard", "inicio", "resumen", "tablero"], run: () => navigate("/dashboard"), feedback: "Dashboard" },
    { keywords: ["criterios", "atp", "diagnostico"], run: () => navigate("/criterios-atp"), feedback: "Criterios ATP-III" },
    { keywords: ["tendencia", "tendencias", "temporal", "evolucion"], run: () => navigate("/tendencias"), feedback: "Tendencias" },
    { keywords: ["exploracion", "multivariada", "variables clinicas"], run: () => navigate("/exploracion"), feedback: "Exploración Multivariada" },
    { keywords: ["modelo", "risk", "riesgo", "calculadora", "machine"], run: () => navigate("/modelo-ml"), feedback: "Modelo ML" },
    { keywords: ["ingesta", "cargar", "subir", "datos", "excel"], run: () => navigate("/ingesta"), feedback: "Ingesta de Datos" },
    { keywords: ["oscuro", "noche"], run: () => setTheme("dark"), feedback: "Modo Oscuro" },
    { keywords: ["claro", "dia", "blanco"], run: () => setTheme("light"), feedback: "Modo Claro" },
  ]

  const process = useCallback(
    (text: string) => {
      const norm = normalize(text)
      const cmd = commands.find((c) => c.keywords.some((k) => norm.includes(normalize(k))))
      if (cmd) {
        setStatus("processing")
        setLastCommand(`Entendido, navegando a ${cmd.feedback}`)
        cmd.run()
        window.setTimeout(() => setVoiceOpen(false), 1100)
      } else {
        setLastCommand(`No reconocí: "${text}"`)
        setStatus("idle")
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const start = useCallback(() => {
    if (!supported) {
      setStatus("unsupported")
      return
    }
    const recognition: SpeechRecognitionLike = new SpeechRecognition()
    recognition.lang = "es-PE"
    recognition.continuous = false
    recognition.interimResults = true
    recognition.onresult = (e) => {
      const last = e.results[e.results.length - 1]
      const text = last[0].transcript
      setTranscript(text)
      if (last.isFinal) process(text)
    }
    recognition.onerror = () => setStatus("error")
    recognition.onend = () => setStatus((s) => (s === "processing" ? s : "idle"))
    recognitionRef.current = recognition
    setTranscript("")
    setStatus("listening")
    recognition.start()
  }, [supported, SpeechRecognition, process])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setStatus("idle")
  }, [])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  return { status, transcript, lastCommand, supported, start, stop }
}

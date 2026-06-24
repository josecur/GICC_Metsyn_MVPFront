import { useEffect } from "react"
import { useUiStore } from "@/shared/store/useUiStore"
import { useVoiceCommands } from "./useVoiceCommands"
import { VoiceOverlay } from "./VoiceOverlay"

/**
 * Admin de Voz — montado UNA sola vez en la raíz del layout (no por página).
 * Abre el overlay y arranca/detiene la escucha según el estado global de UI.
 */
export function VoiceController() {
  const voiceOpen = useUiStore((s) => s.voiceOpen)
  const setVoiceOpen = useUiStore((s) => s.setVoiceOpen)
  const voice = useVoiceCommands()

  useEffect(() => {
    if (voiceOpen) voice.start()
    else voice.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOpen])

  return (
    <VoiceOverlay
      open={voiceOpen}
      onClose={() => setVoiceOpen(false)}
      voice={{
        status: voice.status,
        transcript: voice.transcript,
        lastCommand: voice.lastCommand,
        supported: voice.supported,
      }}
    />
  )
}

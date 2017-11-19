import { getIns } from './utils/disassembler'
import display from './utils/display'
import ops from './ops'
import warning from './utils/warning'
import initMemory from './utils/init-memory'

export default class Merry8 {
  constructor (rom, conf) {
    this.rom = rom
    this.conf = conf
    this.c8 = {
      MEM: initMemory(this.rom),
      V: new Uint8Array(16),
      STACK: new Uint16Array(16),
      KEYS: [
        false, false, false, false,
        false, false, false, false,
        false, false, false, false,
        false, false, false, false
      ],
      I: 0x0000,
      PC: 0x0200,
      SP: 0x00,
      DELAY: 0x00,
      SOUND: 0x00
    }

    display.init(this.conf)
    // FIXME mutate global env.
    if (typeof window !== 'undefined') window.KEYS = this.c8.KEYS
  }

  run = () => {
    const { c8 } = this
    // Emutator main loop. To run the emulator in accpectable speed,
    // most of times we "freeze" the cpu, only runs `insCount` instructions
    // on each loop.
    function mainLoop () {
      // Hard coded insturction count that each loop runs.
      let insCount = 5
      c8.DELAY = Math.max(0, c8.DELAY - 1)
      while (insCount > 0) {
        const { MEM, PC } = c8
        // Move instruction offset.
        const ins = getIns(MEM[PC] << 8 | MEM[PC + 1])
        try {
          // Perform operation according to instruction.
          ops[ins[0]](ins, c8)
        } catch (err) { warning(err, ins, c8) }
        insCount--
      }
      window.requestAnimationFrame(mainLoop)
    }
    window.requestAnimationFrame(mainLoop)
  }
}

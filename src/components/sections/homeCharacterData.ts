export type HomeCharacterId = 'rider' | 'chef' | 'painter' | 'designer'

export type HomeCharacter = {
  id: HomeCharacterId
  name: string
  role: string
  card: string
  portrait: string
  cursor: string
  cursorName: string
  cartridgeLabel: string
}

export const homeCharacters: HomeCharacter[] = [
  {
    id: 'rider',
    name: 'Rider',
    role: 'Motorcycle Mode',
    card: '/home/character-stage/cards/card-rider.svg',
    portrait: '/home/character-stage/portraits/half-rider.svg',
    cursor: '/home/character-stage/cursors/cursor-rider.svg',
    cursorName: 'Throttle Cursor',
    cartridgeLabel: '/home/character-stage/cartridge/label-rider.svg',
  },
  {
    id: 'chef',
    name: 'Chef',
    role: 'Kitchen Mode',
    card: '/home/character-stage/cards/card-chef.svg',
    portrait: '/home/character-stage/portraits/half-chef.svg',
    cursor: '/home/character-stage/cursors/cursor-chef.svg',
    cursorName: 'Spatula Cursor',
    cartridgeLabel: '/home/character-stage/cartridge/label-chef.svg',
  },
  {
    id: 'painter',
    name: 'Painter',
    role: 'Drawing Mode',
    card: '/home/character-stage/cards/card-painter.svg',
    portrait: '/home/character-stage/portraits/half-painter.svg',
    cursor: '/home/character-stage/cursors/cursor-painter.svg',
    cursorName: 'Brush Cursor',
    cartridgeLabel: '/home/character-stage/cartridge/label-painter.svg',
  },
  {
    id: 'designer',
    name: 'Designer',
    role: 'Design Mode',
    card: '/home/character-stage/cards/card-designer.svg',
    portrait: '/home/character-stage/portraits/half-designer.svg',
    cursor: '/home/character-stage/cursors/cursor-designer.svg',
    cursorName: 'Select Cursor',
    cartridgeLabel: '/home/character-stage/cartridge/label-designer.svg',
  },
]

export const cursorGearFrame = '/home/character-stage/cursors/cursor-gear.svg'
export const cartridgeShell = '/home/character-stage/cartridge/cartridge.svg'

export const getHomeCharacterById = (id: HomeCharacterId) =>
  homeCharacters.find((character) => character.id === id) ?? homeCharacters[0]

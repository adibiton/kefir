const {stream, prop, send, Kefir} = require('../test-helpers')

describe('mapErrors', () => {
  describe('stream', () => {
    it('should return stream', () => {
      expect(stream().mapErrors(() => {})).toBeStream()
    })

    it('should activate/deactivate source', () => {
      const a = stream()
      expect(a.mapErrors(() => {})).toActivate(a)
    })

    it('should be ended if source was ended', () =>
      expect(send(stream(), ['<end>']).mapErrors(() => {})).toEmit(['<end:current>']))

    it('should handle events', () => {
      const a = stream()
      expect(a.mapErrors(x => x * 2)).toEmit([1, {error: -2}, 2, {error: -4}, '<end>'], () =>
        send(a, [1, {error: -1}, 2, {error: -2}, '<end>'])
      )
    })
  })

  describe('property', () => {
    it('should return property', () => {
      expect(prop().mapErrors(() => {})).toBeProperty()
    })

    it('should activate/deactivate source', () => {
      const a = prop()
      expect(a.mapErrors(() => {})).toActivate(a)
    })

    it('should be ended if source was ended', () =>
      expect(send(prop(), ['<end>']).mapErrors(() => {})).toEmit(['<end:current>']))

    it('should handle events and current', () => {
      let a = send(prop(), [1])
      expect(a.mapErrors(x => x * 2)).toEmit([{current: 1}, 2, {error: -4}, 3, {error: -6}, '<end>'], () =>
        send(a, [2, {error: -2}, 3, {error: -3}, '<end>'])
      )
      a = send(prop(), [{error: -1}])
      expect(a.mapErrors(x => x * 2)).toEmit([{currentError: -2}, 2, {error: -4}, 3, {error: -6}, '<end>'], () =>
        send(a, [2, {error: -2}, 3, {error: -3}, '<end>'])
      )
    })
  })
})

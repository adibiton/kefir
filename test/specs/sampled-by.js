const {stream, prop, send, activate, deactivate, Kefir} = require('../test-helpers')

describe('sampledBy', () => {
  it('should return stream', () => {
    expect(prop().sampledBy(stream())).toBeStream()
    expect(stream().sampledBy(prop())).toBeStream()
  })

  it('should be ended if array of ended observables provided', () => {
    const a = send(stream(), ['<end>'])
    expect(prop().sampledBy(a)).toEmit(['<end:current>'])
  })

  it('should be ended and emmit current (once) if array of ended properties provided and each of them has current', () => {
    const a = send(prop(), [1, '<end>'])
    const b = send(prop(), [2, '<end>'])
    const s2 = a.sampledBy(b)
    expect(s2).toEmit([{current: 1}, '<end:current>'])
    expect(s2).toEmit(['<end:current>'])
  })

  it('should activate sources', () => {
    const a = stream()
    const b = prop()
    expect(a.sampledBy(b)).toActivate(a, b)
  })

  it('should handle events and current from observables', () => {
    const a = stream()
    const b = send(prop(), [0])
    expect(a.sampledBy(b)).toEmit([2, 4, 4, '<end>'], () => {
      send(b, [1])
      send(a, [2])
      send(b, [3])
      send(a, [4])
      send(b, [5, 6, '<end>'])
    })
  })

  it('should accept optional combinator function', () => {
    const join = (...args) => args.join('+')
    const a = stream()
    const b = send(prop(), [0])
    expect(a.sampledBy(b, join)).toEmit(['2+3', '4+5', '4+6', '<end>'], () => {
      send(b, [1])
      send(a, [2])
      send(b, [3])
      send(a, [4])
      send(b, [5, 6, '<end>'])
    })
  })

  it('one sampledBy should remove listeners of another', () => {
    const a = send(prop(), [0])
    const b = stream()
    const s1 = a.sampledBy(b)
    const s2 = a.sampledBy(b)
    activate(s1)
    activate(s2)
    deactivate(s2)
    expect(s1).toEmit([0], () => send(b, [1]))
  })

  // https://github.com/rpominov/kefir/issues/98
  it('should work nice for emitating atomic updates', () => {
    const a = stream()
    const b = a.map(x => x + 2)
    const c = a.map(x => x * 2)
    expect(b.sampledBy(c, (x, y) => [x, y])).toEmit([[3, 2], [4, 4], [5, 6]], () => send(a, [1, 2, 3]))
  })
})

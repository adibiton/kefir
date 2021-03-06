const {stream, prop, send, activate, deactivate, Kefir} = require('../test-helpers')

describe('merge', () => {
  it('should return stream', () => {
    expect(Kefir.merge([])).toBeStream()
    expect(Kefir.merge([stream(), prop()])).toBeStream()
    expect(stream().merge(stream())).toBeStream()
    expect(prop().merge(prop())).toBeStream()
  })

  it('should be ended if empty array provided', () => {
    expect(Kefir.merge([])).toEmit(['<end:current>'])
  })

  it('should be ended if array of ended observables provided', () => {
    const a = send(stream(), ['<end>'])
    const b = send(prop(), ['<end>'])
    const c = send(stream(), ['<end>'])
    expect(Kefir.merge([a, b, c])).toEmit(['<end:current>'])
    expect(a.merge(b)).toEmit(['<end:current>'])
  })

  it('should activate sources', () => {
    const a = stream()
    const b = prop()
    const c = stream()
    expect(Kefir.merge([a, b, c])).toActivate(a, b, c)
    expect(a.merge(b)).toActivate(a, b)
  })

  it('should deliver events from observables, then end when all of them end', () => {
    let a = stream()
    let b = send(prop(), [0])
    const c = stream()
    expect(Kefir.merge([a, b, c])).toEmit([{current: 0}, 1, 2, 3, 4, 5, 6, '<end>'], () => {
      send(a, [1])
      send(b, [2])
      send(c, [3])
      send(a, ['<end>'])
      send(b, [4, '<end>'])
      send(c, [5, 6, '<end>'])
    })
    a = stream()
    b = send(prop(), [0])
    expect(a.merge(b)).toEmit([{current: 0}, 1, 2, 3, '<end>'], () => {
      send(a, [1])
      send(b, [2])
      send(a, ['<end>'])
      send(b, [3, '<end>'])
    })
  })

  it('should deliver currents from all source properties, but only to first subscriber on each activation', () => {
    const a = send(prop(), [0])
    const b = send(prop(), [1])
    const c = send(prop(), [2])

    let merge = Kefir.merge([a, b, c])
    expect(merge).toEmit([{current: 0}, {current: 1}, {current: 2}])

    merge = Kefir.merge([a, b, c])
    activate(merge)
    expect(merge).toEmit([])

    merge = Kefir.merge([a, b, c])
    activate(merge)
    deactivate(merge)
    expect(merge).toEmit([{current: 0}, {current: 1}, {current: 2}])
  })

  it('errors should flow', () => {
    let a = stream()
    let b = prop()
    let c = stream()
    expect(Kefir.merge([a, b, c])).errorsToFlow(a)
    a = stream()
    b = prop()
    c = stream()
    expect(Kefir.merge([a, b, c])).errorsToFlow(b)
    a = stream()
    b = prop()
    c = stream()
    expect(Kefir.merge([a, b, c])).errorsToFlow(c)
  })

  it('should work correctly when unsuscribing after one sync event', () => {
    const a = Kefir.constant(1)
    const b = Kefir.interval(1000, 1)
    const c = a.merge(b)
    activate(c.take(1))
    expect(b).not.toBeActive()
  })
})

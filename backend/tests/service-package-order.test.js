import { describe, expect, it } from 'vitest';
import { byServiceOrder } from '../src/controllers/services.controller.js';

describe('orden de paquetes dentro de un servicio', () => {
  const pkg = (id, global, inService) => ({ id, sortOrder: global, ServicePackage: inService === undefined ? undefined : { sortOrder: inService } });

  it('usa el orden que se acomodó en el servicio', () => {
    const list = [pkg('a', 0, 2), pkg('b', 1, 0), pkg('c', 2, 1)];
    expect(byServiceOrder(list).map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('si empatan (paquetes viejos en 0), decide el orden general', () => {
    const list = [pkg('a', 5, 0), pkg('b', 1, 0), pkg('c', 3)];
    expect(byServiceOrder(list).map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('no cambia la lista original', () => {
    const list = [pkg('a', 1, 1), pkg('b', 0, 0)];
    byServiceOrder(list);
    expect(list.map((p) => p.id)).toEqual(['a', 'b']);
  });
});

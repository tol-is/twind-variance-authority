import { tva } from './tva';

const styles = tva({
  base: 'tracking-tight',
  props: {
    size: {
      sm: 'text-sm',
      md: ['text-md', 'tracking-wide'],
    },
    level: {
      1: 'text-uppercase',
      2: 'text-normal',
    },
    invert: {
      true: 'bg-black',
      false: 'bg-white',
    },
  },
  defaults: {
    size: 'sm',
    invert: false,
  },
});

describe('it', () => {
  it('no args', () => {
    const classes = styles();

    expect(classes).toEqual('tracking-tight text-sm bg-white');
  });

  it('number param', () => {
    const classes = styles({ level: 1 });

    expect(classes).toEqual('tracking-tight text-sm text-uppercase bg-white');
  });

  it('number param as string ', () => {
    const classes = styles({ level: '1' });

    expect(classes).toEqual('tracking-tight text-sm text-uppercase bg-white');
  });

  it('boolean param', () => {
    const classes = styles({ invert: true });

    expect(classes).toEqual('tracking-tight text-sm bg-black');
  });

  it('boolean param as string', () => {
    const classes = styles({ invert: 'true' });

    expect(classes).toEqual('tracking-tight text-sm bg-black');
  });

  it('responsive side arg', () => {
    const classes = styles({ size: { _: 'sm', md: 'md' }, invert: false });

    expect(classes).toEqual(
      'tracking-tight text-sm md:(text-md tracking-wide) bg-white'
    );
  });
});

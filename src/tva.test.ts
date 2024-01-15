import { tva } from './tva';

const styles = tva({
  base: 'base-class',
  variants: {
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
  it('renders without crashing', () => {
    const classes = styles();

    expect(classes).toEqual('base-class bg-white');
  });

  it('renders without crashing', () => {
    const classes = styles({ size: { _: 'md' } });

    expect(classes).toEqual('base-class bg-white');
  });
});

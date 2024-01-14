type NeverUndefined<T> = T extends undefined ? never : T;
type MaybeUndefined<T> = T | undefined;

type Maybe<T> = T | undefined | null;

type ConfigClassName = Maybe<string | string[]>;
type CSSClassName = Maybe<string>;

type VariantsSchema = Record<string, Record<string, ConfigClassName>>;

type Param<T> = T extends number
  ? `${T}` | T
  : T extends 'true'
  ? boolean | T
  : T extends 'false'
  ? boolean | T
  : T extends `${number}`
  ? number | T
  : T;

export type ResponsiveParam<V> = {
  [key: string]: Param<V>;
};

type ParamsOf<V> = V extends VariantsSchema
  ? {
      [Variant in keyof V]?:
        | Param<keyof V[Variant]>
        | ResponsiveParam<keyof V[Variant]>;
    }
  : never;

type DefaultsOf<V> = V extends VariantsSchema
  ? {
      [Variant in keyof V]?: Param<keyof V[Variant]>;
    }
  : never;

type Config<V> = V extends NeverUndefined<VariantsSchema>
  ? {
      base: MaybeUndefined<ConfigClassName>;
      variants: V;
      defaults: MaybeUndefined<DefaultsOf<V>>;
    }
  : never;

type Factory<V extends VariantsSchema> = (params?: ParamsOf<V>) => CSSClassName;

// extract parameters
export type TVAProps<Component extends (...args: any) => any> =
  Parameters<Component>[0];

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// LIBRARY

/**
 * Twind Variant Authority
 */
export const tva =
  <V extends VariantsSchema>(config: Config<V>): Factory<V> =>
  (params = {} as ParamsOf<V>) => {
    const result = [config.base];
    const factoryParams = { ...config.defaults, ...params };
    const paramsKeys = Object.keys(factoryParams);

    for (const paramsVariantKey of paramsKeys) {
      if (!config.variants.hasOwnProperty(paramsVariantKey)) {
        console.error(`Uknown variant ${paramsVariantKey}`);
        continue;
      }

      const variantConfig = config.variants[paramsVariantKey];
      const paramValue = factoryParams[paramsVariantKey] as Param<V>;

      if (Object.prototype.toString.call(paramValue) !== '[object String]') {
        if (
          paramValue !== undefined &&
          paramValue !== null &&
          !variantConfig.hasOwnProperty(paramValue as string)
        ) {
          console.error(
            `Variant ${paramsVariantKey} has no value ${paramValue}`
          );
          continue;
        }
        result.push(variantConfig[paramValue]);
      } else {
        for (const breakpointKey of Object.keys(paramValue)) {
          const responsiveVariantValue = paramValue[breakpointKey];

          if (
            responsiveVariantValue !== undefined &&
            responsiveVariantValue !== null &&
            !variantConfig.hasOwnProperty(responsiveVariantValue as never)
          ) {
            console.error(
              `Variant ${paramsVariantKey} has no value ${responsiveVariantValue}`
            );
            continue;
          }

          const prefix = breakpointKey === '_' ? '' : `${breakpointKey}:`;
          const breakpointValue =
            variantConfig[responsiveVariantValue as never];

          if (breakpointValue === undefined || breakpointValue === null) {
            continue;
          }

          const responsiveValue = Array.isArray(breakpointValue)
            ? `${prefix}(${breakpointValue.join(' ')})`
            : `${prefix}(${breakpointValue})`;
          result.push(responsiveValue);
        }
      }
    }
    return result.flat().join(' ').trim();
  };

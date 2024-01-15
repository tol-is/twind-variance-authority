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

type ResponsiveParam<V> = {
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
      props: V;
      defaults: MaybeUndefined<DefaultsOf<V>>;
    }
  : never;

type Factory<V extends VariantsSchema> = (params?: ParamsOf<V>) => CSSClassName;

// extract parameters
export type PropsOf<Component extends (...args: any) => any> =
  Parameters<Component>[0];

export const isExists = (n: any) => n !== undefined && n !== null;

export const isUndefined = (n: any) => n === undefined;

export const isArray = (n: any) => Array.isArray(n);

export const isBoolean = (n: any) => typeof n === 'boolean';

export const isNumber = (n: any) => typeof n === 'number' && !Number.isNaN(n);

export const isFunction = (f: any) => typeof f === 'function';

export const isString = (str: any) =>
  Object.prototype.toString.call(str) === '[object String]';

export const isPrimitive = (n: any) =>
  isString(n) || isNumber(n) || isBoolean(n) || isUndefined(n);

export const isObject = (n: any) =>
  isExists(n) && !isArray(n) && typeof n === 'object';

/**
 * Twind Variance Authority
 */
export const tva = <V extends VariantsSchema>(
  config: Config<V>
): Factory<V> => {
  return (params = {} as ParamsOf<V>) => {
    const result = [config.base];

    const configPropsKeys = Object.keys(config.props);
    const factoryParams = configPropsKeys.reduce((acc, variantKey) => {
      const variantValue = params[variantKey] ?? config.defaults?.[variantKey];

      if (variantValue !== undefined && variantValue !== null) {
        acc[variantKey] = variantValue as Param<V>;
      }
      return acc;
    }, {} as Record<string, Param<V>>);

    for (const paramsVariantKey in factoryParams) {
      if (!config.props.hasOwnProperty(paramsVariantKey)) {
        console.error(`Uknown variant ${paramsVariantKey}`);
        continue;
      }

      const propConfig = config.props[paramsVariantKey];
      const paramValue = factoryParams[`${paramsVariantKey}`] as Param<V>;

      if (isPrimitive(paramValue)) {
        if (
          paramValue !== undefined &&
          paramValue !== null &&
          !propConfig.hasOwnProperty(paramValue as string)
        ) {
          console.error(
            `Variant ${paramsVariantKey} has no value ${paramValue}`
          );
          continue;
        }
        result.push(propConfig[paramValue]);
      } else {
        for (const breakpointKey of Object.keys(paramValue)) {
          const responsiveVariantValue = paramValue[breakpointKey];

          if (
            responsiveVariantValue !== undefined &&
            responsiveVariantValue !== null &&
            !propConfig.hasOwnProperty(responsiveVariantValue as never)
          ) {
            console.error(
              `Variant ${paramsVariantKey} has no value ${responsiveVariantValue}`
            );
            continue;
          }

          const prefix = breakpointKey === '_' ? '' : `${breakpointKey}`;
          const breakpointValue = propConfig[responsiveVariantValue as never];

          if (breakpointValue === undefined || breakpointValue === null) {
            continue;
          }

          const stringValue = Array.isArray(breakpointValue)
            ? breakpointValue.join(' ')
            : breakpointValue;
          const responsiveValue = prefix
            ? `${prefix}:(${stringValue})`
            : stringValue;

          result.push(responsiveValue);
        }
      }
    }
    return result.flat().join(' ').trim();
  };
};

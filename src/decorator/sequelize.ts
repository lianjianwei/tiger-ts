import { ModelAttributeColumnOptions, ModelOptions } from 'sequelize';

export const COLUMN_METADATA: {
    [modelName: string]: {
        columnName: string;
        option: ModelAttributeColumnOptions;
        attributeName: string;
    }[];
} = {};

export const TABLE_METADATA: {
    [name: string]: {
        modelName: string;
        options: ModelOptions;
    }
} = {};

export function Table(options: ModelOptions) {
    return (target: any) => {
        TABLE_METADATA[target.name] = {
            modelName: target.name,
            options,
        };
    };
}

export function Column(options: ModelAttributeColumnOptions) {
    return (target: any, propertyKey: string) => {
        COLUMN_METADATA[target.constructor.name] ??= [];
        COLUMN_METADATA[target.constructor.name].push({
            columnName: propertyKey,
            option: options,
            attributeName: options.field,
        });
    };
}

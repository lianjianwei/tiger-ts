import ms from 'ms';
import { ModelAttributeColumnOptions, ModelOptions as _ModelOptions } from 'sequelize';

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

export interface ModelOptions extends _ModelOptions {
    /**
     * 模型分组
     */
    group: string;
    /**
     * 分区配置
     */
    partitionBy?: {
        /**
         * 分区字段
         */
        field: string;
        /**
         * 分区类型，目前仅支持范围分区
         */
        type: 'RANGE';
        /**
         * 范围分区时间单位
         */
        rangeTimeUnit?: 'YEAR' | 'MONTH' | 'DAY';
        /**
         * 过期时间
         * 分区多久之前的要删除掉
         */
        expireUnit: ms.StringValue;
    }
}

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

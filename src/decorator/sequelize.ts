import ms from 'ms';
import { ModelAttributeColumnOptions, ModelIndexesOptions, ModelOptions as _ModelOptions } from 'sequelize';

export type SequelizeModelIndexOptions = ModelIndexesOptions & {
    /**
     * POSTGRES 的 include 索引优化
     */
    include: string[];
};

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
    };
} = {};

export interface ModelOptions extends _ModelOptions {
    indexes?: SequelizeModelIndexOptions[];
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
         * 分区类型，目前支持范围分区(RANGE)和哈希分区(HASH)
         */
        type: 'RANGE' | 'HASH';
        /**
         * range分区配置
         */
        range?: {
            timeUnit: 'YEAR' | 'MONTH' | 'DAY';
            expireTime?: ms.StringValue;
        };
        hash?: {
            /**
             * 哈希分区模数
             * 比如要分 100 个分区，模数就设置为 100
             */
            modulus: number;
        };
    };
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

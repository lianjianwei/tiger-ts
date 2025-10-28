import { CreateIndexesOptions, IndexSpecification } from 'mongodb';

export type IndexOption = {
    spec: IndexSpecification;
    options?: CreateIndexesOptions;
};

export const INDEX_METADATA: {
    [group: string]: {
        [modelName: string]: IndexOption[];
    };
} = {};

export function Collection(option: { name: string; group: string; comment: string; indexes: IndexOption[] }) {
    return (_target: any) => {
        INDEX_METADATA[option.group] ??= {};
        INDEX_METADATA[option.group][option.name] = option.indexes;
    };
}

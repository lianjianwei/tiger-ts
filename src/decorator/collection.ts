import { CreateIndexesOptions, IndexSpecification } from 'mongodb';

export type IndexOption = {
    spec: IndexSpecification;
    options?: CreateIndexesOptions;
};

export type CollectionOption = {
    name: string;
    group: string;
    comment: string;
    indexes?: IndexOption[];
};

export const COLLECTION_METADATA: {
    [modelName: string]: CollectionOption;
} = {};

export function Collection(option: CollectionOption) {
    return (_target: any) => {
        COLLECTION_METADATA[option.name] = option;
    };
}

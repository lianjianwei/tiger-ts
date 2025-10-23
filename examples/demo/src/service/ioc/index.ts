import { ConfigLoaderBase, FileFactoryBase, LogFactoryBase, service } from 'tiger-ts';
import { Container } from 'typedi';

import { config } from '../../model';

/**
 * 初始化IoC容器
 * 
 * @returns 应用配置
 */
export async function initIoC() {
    const fileFactory = new service.FsFileFactory();
    Container.set(FileFactoryBase, fileFactory);

    const isTest = process.argv.some(r => r.includes('mocha'));
    const configYamlFile = fileFactory.buildFile(process.cwd(), isTest ? 'config-test.yaml' : 'config.yaml');

    const configLoader = new service.YamlConfigLoader(configYamlFile);
    const cfg = await configLoader.load(config.App);
    Container.set(ConfigLoaderBase, configLoader);

    const pkgFile = fileFactory.buildFile(process.cwd(), 'package.json');
    const pkg = await pkgFile.readJson<{ version: string; }>();
    cfg.version = pkg.version;

    const logFactory = new service.LogFactory(cfg.logConfiguration);
    Container.set(LogFactoryBase, logFactory);

    return cfg;
}

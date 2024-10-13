import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { Plugin } from 'vite';

interface CopyStaticPluginOptions {
  targets: { src: string; dest: string }[];
}

function copyStaticPlugin(options: CopyStaticPluginOptions): Plugin {
  return {
    name: 'vite-plugin-copy-static',
    apply: 'serve',
    enforce: 'post',
    buildStart() {
      options.targets.forEach(({ src, dest }) => {
        const resolvedDest = path.resolve(process.cwd(), dest);

        // Create destination directory if it doesn't exist
        if (!fs.existsSync(resolvedDest)) {
          fs.mkdirSync(resolvedDest, { recursive: true });
        }

        // Use glob to match files
        glob.sync(src, { cwd: process.cwd(), nodir: true }).forEach((file) => {
          // 找出src的*开始的位置，开始切割，*前面的为要替换的位置
          const replacePath = src.substring(0, src.indexOf('*') - 1);
          const targetPath = path.join(dest, file.replace(replacePath, ''));
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          fs.copyFileSync(file, targetPath);
        });
      });
    },
  };
}

export default copyStaticPlugin;

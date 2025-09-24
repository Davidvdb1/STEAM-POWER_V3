import { dirname, join } from 'path'
import { fileURLToPath } from 'url'


const __dirname = dirname(join(fileURLToPath(import.meta.url), '..'));
export default __dirname;
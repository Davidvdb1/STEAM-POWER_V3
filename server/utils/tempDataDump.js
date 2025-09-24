import fs from 'fs/promises';
import os from 'os';
import path from 'path';

export const dumpResultToTempFile = async (result) => {
    const tempDir = os.tmpdir();
    const filename = `RE-Frame_DataDump-${Date.now()}.txt`;
    const filePath = path.join(tempDir, filename);

    try {
        await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');
        console.log(`✅ Result saved to ${filePath}`);
        return filePath;
    } catch (err) {
        console.error('❌ Failed to write result file:', err);
        throw err;
    }
};
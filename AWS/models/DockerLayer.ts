import * as fs from 'fs';
import path from 'path';
import * as os from 'os';

export class DockerLayer {
  public archivosTempPython(requirements: string[], pythonVersion: string, nArchivo: string): { dockerfilePath: string, workDir: string } {
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'espacioparalayer-'));

    const dockerfilePath = path.join(workDir, 'Dockerfile');
    const requirementsPath = path.join(workDir, 'requirements.txt');


    const dockerfileContent = `
FROM python:${pythonVersion}-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt -t /python

RUN apt-get update && apt-get install -y --no-install-recommends zip

RUN zip -r ${nArchivo}.zip /python

CMD ["echo", "Python dependencies packaged!"]
`;

    // Crear los archivos temporales
    fs.writeFileSync(dockerfilePath, dockerfileContent);
    fs.writeFileSync(requirementsPath, requirements.join('\n'));

    return { dockerfilePath, workDir };
  }
}

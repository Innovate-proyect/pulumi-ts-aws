import * as fs from 'fs';
import path from 'path';
import * as os from 'os';

export class DockerLayer {
  public archivosTempPython(requirements: string[], pythonVersion: string, nArchivo: string): { dockerfilePath: string, workDir: string } {
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'espacioparalayer-'));

    const dockerfilePath = path.join(workDir, 'Dockerfile');
    const requirementsPath = path.join(workDir, 'requirements.txt');


    const dockerfileContent = `
FROM python:${pythonVersion}

WORKDIR /app

RUN apt-get update && apt-get install -y \
  python3-venv \
  zip

RUN python${pythonVersion} -m venv create_layer

RUN /bin/bash -c "source create_layer/bin/activate && pip install --upgrade pip"

COPY requirements.txt .

RUN /bin/bash -c "source create_layer/bin/activate && pip install -r requirements.txt"

RUN mkdir python

RUN cp -r create_layer/lib python/

RUN zip -r ${nArchivo}.zip python/

CMD ["echo", "Layer created and packaged!"]
`;

    // Crear los archivos temporales
    fs.writeFileSync(dockerfilePath, dockerfileContent);
    fs.writeFileSync(requirementsPath, requirements.join('\n'));

    return { dockerfilePath, workDir };
  }
}

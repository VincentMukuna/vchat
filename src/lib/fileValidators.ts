import { FileWithPath } from "file-selector";
import { UseFilePickerConfig } from "use-file-picker/dist/interfaces";
import { Validator } from "use-file-picker/validators";

export class FileTypeValidator extends Validator {
  types: string[];
  constructor(acceptedTypes: string[]) {
    super();
    this.types = acceptedTypes;
  }
  async validateBeforeParsing(
    config: UseFilePickerConfig<any>,
    plainFiles: File[],
  ): Promise<void> {
    return new Promise((res, rej) => {
      for (const file of plainFiles) {
        if (this.types.includes(file.type)) {
          res();
        }

        rej({ reason: "File type not supported" });
      }
    });
  }
  async validateAfterParsing(
    config: UseFilePickerConfig<any>,
    file: FileWithPath,
    reader: FileReader,
  ): Promise<void> {}
}

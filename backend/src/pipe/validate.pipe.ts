import { ArgumentMetadata, BadRequestException, Injectable, UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { StringHelper } from "../helpers/string.helper";

@Injectable()
export class ValidateInputPipe extends ValidationPipe {

    public async transform(value, metadata: ArgumentMetadata) {
        try {
            return await super.transform(value, metadata);
        } catch (e) {
            if (e instanceof BadRequestException) {
                throw new UnprocessableEntityException(StringHelper.titleCaseWord(e.getResponse()['message'][0]));
            }
        }
    }
}
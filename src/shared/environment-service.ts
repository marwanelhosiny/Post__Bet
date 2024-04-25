import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EnvironmentService {
    constructor(private readonly configService: ConfigService) { }

    getFromEnv(key: string): string {
        const value = this.configService.get<string>(key);
        if (value) {
            return value;
        }
        throw new NotFoundException(`Could not find result for key ${key} from current env`);
    }
}
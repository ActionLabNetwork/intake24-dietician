import { NotFoundError } from "@/utils/trpc";
import { UserRepository } from "@intake24-dietician/db-new/repositories/user.repository";
import { inject, singleton } from "tsyringe";

@singleton()
export class PatientService {
    public constructor(
        @inject(UserRepository) private userRepository: UserRepository,
    ) {}

    public async getPatientById(id: number) {
        const patient = await this.userRepository.getPatient(id);
        if (!patient) throw new NotFoundError("Patient not found");
        return patient;
    }

}
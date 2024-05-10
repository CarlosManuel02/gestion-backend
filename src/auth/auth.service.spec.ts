import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/auth.entity";
import { DataSource, Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";

describe("AuthService", () => {
  let service: AuthService;
  const mockUserRepository = {
    create: jest.fn().mockImplementation(dto => dto)
  };
  const mockDataSource = {}; // Mock DataSource as needed
  const mockJwtService = {}; // Mock JwtService as needed

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository
        },
        {
          provide: DataSource, // Provide DataSource
          useValue: mockDataSource
        },
        {
          provide: JwtService, // Provide JwtService
          useValue: mockJwtService
        },
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

});

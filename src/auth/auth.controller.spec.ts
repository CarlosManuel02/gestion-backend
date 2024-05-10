import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";

describe("AuthController", () => {
  let controller: AuthController;

  const mockAuthService = {
    create: jest.fn(dto => {
      return {
        user: expect.any(String),
        token: expect.any(String),
        status: expect.any(Number)
      };
    }),
    login: jest.fn(dto => {
      return {
        user: expect.any(String),
        token: expect.any(String),
        status: expect.any(Number)
      };
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService]
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should create a user", async () => {
    const user: CreateAuthDto = {
      email: "test@test.com",
      password: "12345678",
      username: "test"
    };
    expect(controller.Register(user)).toEqual({
      user: expect.any(String),
      token: expect.any(String),
      status: 200
    });
  });

  it("should login a user", async () => {
    const dto: CreateAuthDto = {
      email: "test@test.com",
      password: "12345678"
    };
    expect(controller.Login(dto)).toEqual({
      user: expect.any(String),
      token: expect.any(String),
      status: 200
    });
  });

});

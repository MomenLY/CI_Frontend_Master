import { updateSettings } from 'src/utils/settingsLibrary';
import { LoginSignupSettingsUpdateAPI } from '../apis/Login-Signup-Settings-Update-Api';

jest.mock('src/utils/settingsLibrary', () => ({
  updateSettings: jest.fn(),
}));

describe('LoginSignupSettingsUpdateAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call updateSettings with correct parameters', async () => {
    const mockData = {
      signup: true,
      signin: true,
      layout: 'layout1',
      isGoogle: true,
      isFacebook: false,
      isApple: true,
    };
    const mockResponse = { success: true };
    (updateSettings as jest.MockedFunction<typeof updateSettings>).mockResolvedValueOnce(mockResponse);

    const response = await LoginSignupSettingsUpdateAPI(mockData);

    expect(updateSettings).toHaveBeenCalledWith({
      key: 'signin_signup',
      name: 'signin_signup setting',
      settings: {
        layout: `${mockData.layout}`,
        isLoginEnabled: mockData.signin,
        isSignUpEnabled: mockData.signup,
        socialMediaLogin: {
          apple: mockData.isApple,
          google: mockData.isGoogle,
          facebook: mockData.isFacebook,
        },
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('should throw an error if updateSettings throws an error', async () => {
    const mockData = {
      signup: true,
      signin: true,
      layout: 'layout1',
      isGoogle: true,
      isFacebook: false,
      isApple: true,
    };
    const mockError = new Error('Something went wrong');
    (updateSettings as jest.MockedFunction<typeof updateSettings>).mockRejectedValueOnce(mockError);

    await expect(LoginSignupSettingsUpdateAPI(mockData)).rejects.toThrow(mockError);
  });
});
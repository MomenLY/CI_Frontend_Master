import { updateSettings } from 'src/utils/settingsLibrary';
import { PasswordSettingsUpdateAPI } from '../apis/Password-Settings-Update-Api';

jest.mock('src/utils/settingsLibrary', () => ({
  updateSettings: jest.fn(),
}));

describe('PasswordSettingsUpdateAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call updateSettings with correct parameters', async () => {
    const mockData = { newPassword: 'newPassword123' };
    const mockResponse = { success: true };
    (updateSettings as jest.MockedFunction<typeof updateSettings>).mockResolvedValueOnce(mockResponse);

    const response = await PasswordSettingsUpdateAPI({ data: mockData });

    expect(updateSettings).toHaveBeenCalledWith({
      key: 'password',
      name: 'password setting',
      settings: mockData,
    });
    expect(response).toEqual(mockResponse);
  });

  it('should throw an error if updateSettings throws an error', async () => {
    const mockData = { newPassword: 'newPassword123' };
    const mockError = new Error('Something went wrong');
    (updateSettings as jest.MockedFunction<typeof updateSettings>).mockRejectedValueOnce(mockError);

    await expect(PasswordSettingsUpdateAPI({ data: mockData })).rejects.toThrow(mockError);
  });
});
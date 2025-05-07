import { updateSettings } from 'src/utils/settingsLibrary';
import { LayoutUpdateAPI } from '../apis/Layout-Update-Api';

jest.mock('src/utils/settingsLibrary', () => ({
  updateSettings: jest.fn(),
}));

describe('LayoutUpdateAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call updateSettings with correct parameters', async () => {
    const mockLayout = 'layout1';
    const mockResponse = { success: true };
    (updateSettings as jest.MockedFunction<typeof updateSettings>).mockResolvedValueOnce(mockResponse);

    const response = await LayoutUpdateAPI({ layout: mockLayout });

    expect(updateSettings).toHaveBeenCalledWith({
      key: 'layout',
      name: 'layout setting',
      settings: { layout: mockLayout },
    });
    expect(response).toEqual(mockResponse);
  });

  it('should throw an error if updateSettings throws an error', async () => {
    const mockLayout = 'layout1';
    const mockError = new Error('Something went wrong');
    (updateSettings as jest.MockedFunction<typeof updateSettings>).mockRejectedValueOnce(mockError);

    await expect(LayoutUpdateAPI({ layout: mockLayout })).rejects.toThrow(mockError);
  });
});
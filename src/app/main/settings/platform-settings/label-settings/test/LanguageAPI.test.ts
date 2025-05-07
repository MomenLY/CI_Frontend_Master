import axios from 'axios';
import { getLanguagesAPI, updateLanguagesAPI } from '../apis/LanguageAPI';

jest.mock('axios');

describe('languagesAPI', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLanguagesAPI', () => {
    it('should call the correct URL with search parameter', async () => {
      const mockResponse = { data: { data: ['language1', 'language2'] } };
      const search = 'search_term';
      (axios.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getLanguagesAPI(search);

      expect(axios.request).toHaveBeenCalledWith({
        url: '/languages/en?search=search_term',
        method: 'get',
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should call the correct URL without search parameter', async () => {
      const mockResponse = { data: { data: ['language1', 'language2'] } };
      (axios.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getLanguagesAPI('');

      expect(axios.request).toHaveBeenCalledWith({
        url: '/languages/en',
        method: 'get',
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      (axios.request as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(getLanguagesAPI('')).rejects.toThrow(mockError);
    });
  });

  describe('updateLanguagesAPI', () => {
    it('should call the correct URL with data', async () => {
      const mockResponse = { data: { data: ['updated_language1', 'updated_language2'] } };
      const languageDefinitions = ['language1', 'language2'];
      (axios.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await updateLanguagesAPI(languageDefinitions);

      expect(axios.request).toHaveBeenCalledWith({
        url: '/languages',
        method: 'patch',
        data: {
          data: languageDefinitions,
          language: 'en',
        },
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      const languageDefinitions = ['language1', 'language2'];
      (axios.request as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(updateLanguagesAPI(languageDefinitions)).rejects.toThrow(mockError);
    });
  });
});
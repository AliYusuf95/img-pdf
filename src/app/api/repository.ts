import { useQuery } from 'react-query';
import { UseQueryResult } from 'react-query/types/react/types';

export interface RepositoryDTO {
  rank: number;
  username: string;
  repositoryName: string;
  url: string;
  description: string;
  language: string;
  languageColor: string;
  totalStars: number;
  forks: number;
  starsSince: number;
  since: string;
  builtBy: {
    username: string;
    url: string;
    avatar: string;
  }[];
}

export function getRepositories(): UseQueryResult<RepositoryDTO[], Error> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery('/repositories');
}

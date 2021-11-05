import { useQuery } from 'react-query';
import { UseQueryResult } from 'react-query/types/react/types';

export interface DeveloperDTO {
  rank: number;
  username: string;
  name: string;
  url: string;
  avatar: string;
  since: string;
  popularRepository: {
    repositoryName: string;
    description: string;
    url: string;
  };
}

export function getDevelopers(): UseQueryResult<DeveloperDTO[], Error> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery('/developers');
}

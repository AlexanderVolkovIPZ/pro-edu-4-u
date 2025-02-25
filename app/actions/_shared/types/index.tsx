import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next/types';

export type GetServerSessionParams =
  | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
  | [NextApiRequest, NextApiResponse]
  | [];

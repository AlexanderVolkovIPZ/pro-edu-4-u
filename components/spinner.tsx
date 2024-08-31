import { Loader2 } from 'lucide-react';

type Spinner = {
  width?: string | number;
  height?: string | number;
  color?: string;
  animate?: string;
};

const Spinner = ({ width = 32, height = 32, color = 'text-secondary', animate = 'animate-spin' }: Spinner) => {
  return <Loader2 className={`${animate} ${color}`} style={{ width: `${width}px`, height: `${height}px` }} />;
};

export default Spinner;

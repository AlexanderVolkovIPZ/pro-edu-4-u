import { Loader2 } from 'lucide-react';

type Spinner = {
  width?: string | number;
  height?: string | number;
  color?: string;
  animate?: string;
};

const Spinner = ({ width = 26, height = 26, color = 'text-secondary', animate = 'animate-spin' }: Spinner) => {
  return <Loader2 className={`${animate} ${color}`} style={{ width: `${width}px`, height: `${height}px` }} />;
};

export default Spinner;

import { createPortal } from 'react-dom';

const ConnectionLabel = () => {
  return createPortal(
    <div className='fixed top-2 right-1/2 translate-x-1/2 bg-yellow-200 text-yellow-800 px-4 py-2 rounded shadow z-50'>
      Connection...
    </div>,
    document.body
  );
};

export default ConnectionLabel;

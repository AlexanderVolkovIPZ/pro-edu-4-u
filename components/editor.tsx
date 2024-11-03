'use client';

import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Editor = ({ value, onChange, ...props }: ReactQuillProps) => {
  return (
    <ReactQuill
      {...props}
      value={value}
      onChange={onChange}
      placeholder='...'
      theme='snow'
      modules={modules}
      formats={formats}
    />
  );
};

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: ['tiny', 'small', false, 'large'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'link',
  'image',
  'video',
];

export default Editor;

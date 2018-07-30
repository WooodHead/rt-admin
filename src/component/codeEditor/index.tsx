import * as React from 'react';
import classNames from 'classnames';
import { set } from 'lodash';
// import jsyaml from 'js-yaml';
import { Spin } from 'antd';

import { loadFiles } from '../../util/misc';
import monacoConfig from './config';

import styes from './index.less';

interface CodeEditorProps {
  name: string;
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  language?: 'javascript' | 'json' | 'yaml';
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: any) => void;
}

type CodeEditorState = {
  isLoading: boolean;
};

export default class CodeEditor extends React.PureComponent<CodeEditorProps, CodeEditorState> {
  static defaultProps = {
    language: 'javascript',
    theme: 'vs-dark',
  };

  state = {
    isLoading: true,
  };

  private monaco: any;
  private $div: React.RefObject<HTMLDivElement> = React.createRef();

  async componentDidMount() {
    if ((window as any).monaco) {
      this.initMonaco();
    } else {
      await this.loadMonaco();
      setTimeout(this.initMonaco, 100);
    }
  }

  componentWillUnmount() {
    this.monaco.dispose();
    this.monaco = null;
  }

  loadMonaco = async () => {
    set(window, 'require.paths.vs', monacoConfig.sourcePath);
    set((window as any).require, 'vs/nls', {
      availableLanguages: { '*': monacoConfig.lang },
      locale: monacoConfig.lang,
    });
    await loadFiles([
      `${monacoConfig.sourcePath}/editor/editor.main.css`,
      `${monacoConfig.sourcePath}/loader.js`,
      `${monacoConfig.sourcePath}/editor/editor.main.nls.js`,
      `${monacoConfig.sourcePath}/editor/editor.main.js`,
    ]);
  }

  initMonaco = () => {
    const { defaultValue, value, language, theme } = this.props;

    this.monaco = (window as any).monaco.editor.create(
      this.$div.current, {
        language,
        theme,
        value: value || defaultValue || '',
      }
    );

    this.setState({ isLoading: false });
    this.monaco.onDidChangeContent = this.onChange;
  }

  onChange = () => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(this.monaco.getValue());
    }
  }

  render() {
    const { isLoading } = this.state;
    return (
      <Spin spinning={isLoading} >
        <div
          className={classNames({
            'transparent': isLoading },
            styes.monacoEditor)
          }
          ref={this.$div}
        />
      </Spin>
    );
  }
}
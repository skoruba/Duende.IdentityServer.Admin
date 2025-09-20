import * as React from "react";
import { css, cx } from "@emotion/css";
import type { ReactNode } from "react";

export interface TreeNodeProps {
  /**
   * The node label
   * */
  label: React.ReactNode;
  className?: string;
  children?: ReactNode;
}

const verticalLine = css`
  content: "";
  position: absolute;
  top: 0;
  height: var(--tree-line-height);
  box-sizing: border-box;
`;

const childrenContainer = css`
  display: flex;
  padding-inline-start: 0;
  margin: 0;
  padding-top: var(--tree-line-height);
  position: relative;

  ::before {
    ${verticalLine};
    left: calc(50% - var(--tree-line-width) / 2);
    width: 0;
    border-left: var(--tree-line-width) var(--tree-node-line-style)
      var(--tree-line-color);
  }
`;

const node = css`
  flex: auto;
  text-align: center;
  list-style-type: none;
  position: relative;
  padding: var(--tree-line-height) var(--tree-node-padding) 0
    var(--tree-node-padding);
  word-break: break-all;
`;

const nodeLines = css`
  ::before,
  ::after {
    ${verticalLine};
    right: 50%;
    width: 50%;
    border-top: var(--tree-line-width) var(--tree-node-line-style)
      var(--tree-line-color);
  }
  ::after {
    left: 50%;
    border-left: var(--tree-line-width) var(--tree-node-line-style)
      var(--tree-line-color);
  }

  :only-of-type {
    padding: 0;
    ::after,
    :before {
      display: none;
    }
  }

  :first-of-type {
    ::before {
      border: 0 none;
    }
    ::after {
      border-radius: var(--tree-line-border-radius) 0 0 0;
    }
  }

  :last-of-type {
    ::before {
      border-right: var(--tree-line-width) var(--tree-node-line-style)
        var(--tree-line-color);
      border-radius: 0 var(--tree-line-border-radius) 0 0;
    }
    ::after {
      border: 0 none;
    }
  }
`;

function TreeNode({ children, label, className }: TreeNodeProps) {
  return (
    <li className={cx(node, nodeLines, className)}>
      {label}
      {React.Children.count(children) > 0 && (
        <ul className={childrenContainer}>{children}</ul>
      )}
    </li>
  );
}

export default TreeNode;

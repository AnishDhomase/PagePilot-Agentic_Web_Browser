import { DOMElementNode } from '../views';
import { DOMHistoryElement, HashedDomElement } from './view';

export namespace HistoryTreeProcessor {
  /**
   * Operations on the DOM elements
   * @dev be careful - text nodes can change even if elements stay the same
   */

  export function convertDomElementToHistoryElement(domElement: DOMElementNode): DOMHistoryElement {
    const parentBranchPath = getParentBranchPath(domElement);
    const cssSelector = domElement.getAdvancedCssSelector();
    return new DOMHistoryElement(
      domElement.tagName ?? '', // Provide empty string as fallback
      domElement.xpath ?? '', // Provide empty string as fallback
      domElement.highlightIndex ?? null,
      parentBranchPath,
      domElement.attributes,
      domElement.shadowRoot,
      cssSelector,
      domElement.pageCoordinates ?? null,
      domElement.viewportCoordinates ?? null,
      domElement.viewportInfo ?? null,
    );
  }

  export async function findHistoryElementInTree(
    domHistoryElement: DOMHistoryElement,
    tree: DOMElementNode,
  ): Promise<DOMElementNode | null> {
    const hashedDomHistoryElement = await hashDomHistoryElement(domHistoryElement);

    const processNode = async (node: DOMElementNode): Promise<DOMElementNode | null> => {
      if (node.highlightIndex !== undefined) {
        const hashedNode = await hashDomElement(node);
        if (
          hashedNode.branchPathHash === hashedDomHistoryElement.branchPathHash &&
          hashedNode.attributesHash === hashedDomHistoryElement.attributesHash &&
          hashedNode.xpathHash === hashedDomHistoryElement.xpathHash
        ) {
          return node;
        }
      }
      for (const child of node.children) {
        if (child instanceof DOMElementNode) {
          const result = await processNode(child);
          if (result !== null) {
            return result;
          }
        }
      }
      return null;
    };

    return processNode(tree);
  }

  export async function compareHistoryElementAndDomElement(
    domHistoryElement: DOMHistoryElement,
    domElement: DOMElementNode,
  ): Promise<boolean> {
    const [hashedDomHistoryElement, hashedDomElement] = await Promise.all([
      hashDomHistoryElement(domHistoryElement),
      hashDomElement(domElement),
    ]);

    return (
      hashedDomHistoryElement.branchPathHash === hashedDomElement.branchPathHash &&
      hashedDomHistoryElement.attributesHash === hashedDomElement.attributesHash &&
      hashedDomHistoryElement.xpathHash === hashedDomElement.xpathHash
    );
  }

  async function hashDomHistoryElement(domHistoryElement: DOMHistoryElement): Promise<HashedDomElement> {
    const [branchPathHash, attributesHash, xpathHash] = await Promise.all([
      parentBranchPathHash(domHistoryElement.entireParentBranchPath),
      hashAttributes(domHistoryElement.attributes),
      hashXPath(domHistoryElement.xpath ?? ''),
    ]);
    return new HashedDomElement(branchPathHash, attributesHash, xpathHash);
  }

  export async function hashDomElement(domElement: DOMElementNode): Promise<HashedDomElement> {
    const parentBranchPath = getParentBranchPath(domElement);
    const [branchPathHash, attributesHash, xpathHash] = await Promise.all([
      parentBranchPathHash(parentBranchPath),
      hashAttributes(domElement.attributes),
      hashXPath(domElement.xpath ?? ''),
    ]);
    return new HashedDomElement(branchPathHash, attributesHash, xpathHash);
  }

  export function getParentBranchPath(domElement: DOMElementNode): string[] {
    const parents: DOMElementNode[] = [];
    let currentElement: DOMElementNode = domElement;

    while (currentElement.parent !== null && currentElement.parent !== undefined) {
      parents.push(currentElement);
      currentElement = currentElement.parent;
    }

    parents.reverse();
    return parents.map(parent => parent.tagName ?? '');
  }

  export async function parentBranchPathHash(parentBranchPath: string[]): Promise<string> {
    if (parentBranchPath.length === 0) return '';
    return createSHA256Hash(parentBranchPath.join('/'));
  }

  export async function hashAttributes(attributes: Record<string, string>): Promise<string> {
    const attributesString = Object.entries(attributes)
      .map(([key, value]) => `${key}=${value}`)
      .join('');
    return createSHA256Hash(attributesString);
  }

  export async function hashXPath(xpath: string): Promise<string> {
    return createSHA256Hash(xpath);
  }

  // async function hashText(domElement: DOMElementNode): Promise<string> {
  //     const textString = domElement.getAllTextTillNextClickableElement();
  //     return createSHA256Hash(textString);
  // }

  export async function createSHA256Hash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

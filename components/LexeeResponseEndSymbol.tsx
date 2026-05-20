import Image from "next/image";

type LexeeResponseEndSymbolProps = {
  /** Pass true only for the final assistant turn when the thread is not generating. */
  visible: boolean;
};

/**
 * Product rule: the Lexee symbol marks the end of the latest assistant reply only —
 * never on earlier assistant messages in the same conversation.
 */
export function LexeeResponseEndSymbol({ visible }: LexeeResponseEndSymbolProps) {
  if (!visible) return null;

  return (
    <div className="mt-2 flex h-6 items-center" aria-hidden="true">
      <Image src="/lexee-symbol.svg" alt="" width={20} height={20} />
    </div>
  );
}

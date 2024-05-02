import React, { useRef, useEffect } from 'react';

import '@xterm/xterm/css/xterm.css';

import { Terminal, ITerminalOptions, ITerminalAddon } from '@xterm/xterm';

interface IProps {
	/**
	 * ID to add to the terminal container.
	 */
	id?: string;

	/**
	 * Class name to add to the terminal container.
	 */
	className?: string;

	/**
	 * Options to pass to the `Terminal` constructor.
	 * @see https://xtermjs.org/docs/api/terminal/interfaces/iterminaloptions/
	 */
	options?: ITerminalOptions;

	/**
	 * An array of XTerm addons to load along with the terminal.
	 */
	addons?: Array<ITerminalAddon>;

	/**
	 * Adds an event listener for when the bell is triggered.
	 * @returns an `IDisposable` to stop listening.
	 */
	onBell?(): void;

	/**
	 * Adds an event listener for when a binary event fires. This is used to
	 * enable non UTF-8 conformant binary messages to be sent to the backend.
	 * Currently this is only used for a certain type of mouse reports that
	 * happen to be not UTF-8 compatible.
	 * The event value is a JS string, pass it to the underlying pty as
	 * binary data, e.g. `pty.write(Buffer.from(data, 'binary'))`.
	 * @returns an `IDisposable` to stop listening.
	 */
	onBinary?(data: string): void;

	/**
	 * Adds an event listener for the cursor moves.
	 * @returns an `IDisposable` to stop listening.
	 */
	onCursorMove?(): void;

	/**
	 * Adds an event listener for when a data event fires. This happens for
	 * example when the user types or pastes into the terminal. The event value
	 * is whatever `string` results, in a typical setup, this should be passed
	 * on to the backing pty.
	 * @returns an `IDisposable` to stop listening.
	 */
	onData?(data: string): void;

	/**
	 * Adds an event listener for when a key is pressed. The event value
	 * contains the string that will be sent in the data event as well as the
	 * DOM event that triggered it.
	 * @returns an `IDisposable` to stop listening.
	 */
	onKey?(event: { key: string; domEvent: KeyboardEvent }): void;

	/**
	 * Adds an event listener for when a line feed is added.
	 * @returns an `IDisposable` to stop listening.
	 */
	onLineFeed?(): void;

	/**
	 * Adds an event listener for when rows are rendered. The event value
	 * contains the start row and end rows of the rendered area (ranges from `0`
	 * to `Terminal.rows - 1`).
	 * @returns an `IDisposable` to stop listening.
	 */
	onRender?(data: { start: number; end: number }): void;

	/**
	 * Adds an event listener for when the terminal is resized. The event value
	 * contains the new size.
	 * @returns an `IDisposable` to stop listening.
	 */
	onResize?(data: { cols: number; rows: number }): void;

	/**
	 * Adds an event listener for when a scroll occurs. The event value is the
	 * new position of the viewport.
	 * @returns an `IDisposable` to stop listening.
	 */
	onScroll?(): void;

	/**
	 * Adds an event listener for when a selection change occurs.
	 * @returns an `IDisposable` to stop listening.
	 */
	onSelectionChange?(): void;

	/**
	 * Adds an event listener for when an OSC 0 or OSC 2 title change occurs.
	 * The event value is the new title.
	 * @returns an `IDisposable` to stop listening.
	 */
	onTitleChange?(title: string): void;

	/**
	 * Adds an event listener for when data has been parsed by the terminal,
	 * after {@link write} is called. This event is useful to listen for any
	 * changes in the buffer.
	 *
	 * This fires at most once per frame, after data parsing completes. Note
	 * that this can fire when there are still writes pending if there is a lot
	 * of data.
	 */
	onWriteParsed?(): void;

	/**
	 * Attaches a custom key event handler which is run before keys are
	 * processed, giving consumers of xterm.js ultimate control as to what keys
	 * should be processed by the terminal and what keys should not.
	 *
	 * @param event The custom KeyboardEvent handler to attach.
	 * This is a function that takes a KeyboardEvent, allowing consumers to stop
	 * propagation and/or prevent the default action. The function returns
	 * whether the event should be processed by xterm.js.
	 */
	customKeyEventHandler?(event: KeyboardEvent): boolean;

	/**
	 * Adds an event listener for when the terminal is initialized.
	 * This provides a reference to the `Terminal` object.
	 */
	onInit?(term: Terminal): void;

	/**
	 * Adds an event listener for when the terminal is disposed.
	 */
	onDispose?(term: Terminal): void;

  onMount?(term: Terminal): void;

  /**
   * A ref to the terminal instance.
   */
  bindRef?: React.MutableRefObject<{ term: Terminal, div: HTMLDivElement } | null>;
}

function useBind(
	termRef: React.RefObject<{ term: Terminal, div: HTMLDivElement }>,
	handler: any,
	eventName:
		| 'onBell'
		| 'onBinary'
		| 'onCursorMove'
		| 'onData'
		| 'onKey'
		| 'onLineFeed'
		| 'onRender'
		| 'onResize'
		| 'onScroll'
		| 'onSelectionChange'
		| 'onTitleChange'
		| 'onWriteParsed'
) {
	useEffect(() => {
		if (!termRef.current || typeof handler !== 'function') return;
		const term = termRef.current;
		const eventBinding = term.term[eventName](handler);
		return () => {
			if (!eventBinding) return;
			eventBinding.dispose();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [handler]);
}

export const Xterm = ({
	id,
	className,
	options,
	addons,
	onBell,
	onBinary,
	onCursorMove,
	onData,
	onKey,
	onLineFeed,
	onRender,
	onResize,
	onScroll,
	onSelectionChange,
	onTitleChange,
	onWriteParsed,
	customKeyEventHandler,
	onInit,
	onDispose,
  onMount,
  bindRef,
}: IProps) => {
	const divRef = useRef<HTMLDivElement | null>(null);
	const xtermRef = useRef<{ term: Terminal, div: HTMLDivElement } | null>(null);

	useEffect(() => {
		if (!divRef.current) return;
		const xterm = new Terminal(options);

		// Load addons if the prop exists.
		if (addons) {
			addons.forEach((addon) => {
				xterm.loadAddon(addon);
			});
		}

		// Add Custom Key Event Handler if provided
		if (customKeyEventHandler) {
			xterm.attachCustomKeyEventHandler(customKeyEventHandler);
		}
    
		xtermRef.current = {
      term: xterm,
      div: divRef.current,
    };

    if (bindRef) {
      bindRef.current = xtermRef.current;
    }
		xterm.open(divRef.current);
    
    if (typeof onMount === 'function') onMount(xterm);

		return () => {
			if (typeof onDispose === 'function') onDispose(xterm);
			try {
				xterm.dispose();
			} catch (e) {
				console.error(e);
			}
			xtermRef.current = null;
		};
	}, [options, addons, bindRef, customKeyEventHandler, onDispose, onMount]);

	useBind(xtermRef, onBell?.bind(xtermRef), 'onBell');
	useBind(xtermRef, onBinary?.bind(xtermRef), 'onBinary');
	useBind(xtermRef, onCursorMove?.bind(xtermRef), 'onCursorMove');
	useBind(xtermRef, onData?.bind(xtermRef), 'onData');
	useBind(xtermRef, onKey?.bind(xtermRef), 'onKey');
	useBind(xtermRef, onLineFeed?.bind(xtermRef), 'onLineFeed');
	useBind(xtermRef, onRender?.bind(xtermRef), 'onRender');
	useBind(xtermRef, onResize?.bind(xtermRef), 'onResize');
	useBind(xtermRef, onScroll?.bind(xtermRef), 'onScroll');
	useBind(xtermRef, onSelectionChange?.bind(xtermRef), 'onSelectionChange');
	useBind(xtermRef, onTitleChange?.bind(xtermRef), 'onTitleChange');
	useBind(xtermRef, onWriteParsed?.bind(xtermRef), 'onWriteParsed');

	useEffect(
		() => {
			if (!xtermRef.current) return;
			if (typeof onInit !== 'function') return;
			onInit(xtermRef.current.term);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[xtermRef.current]
	);

	return <div id={id} className={className} ref={divRef} />;
};

export default Xterm;

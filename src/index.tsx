import { Action, ActionPanel, Detail, getPreferenceValues, openCommandPreferences, showToast } from "@raycast/api";
import { useState } from "react";

type IVariable = {value: string; key: KEYS; on:boolean; toggle_key: TOGGLE_KEYS}
type KEYS = "nome" | "endereco" | "cpf" | "rg";
type TOGGLE_KEYS = "n" | "e" | "c" | "r";

function variable_line_template(v: IVariable) { return `${v.key}: ${v.value}`}
const INIT_STATE: IVariable[] = [
  { key: "nome", value: "John Doe", on: true, toggle_key: 'n'},
  { key: "endereco", value: "123 Main St", on: true, toggle_key: 'e' },
  { key: "cpf", value: "123.456.789-00", on: true, toggle_key: 'c' },
  { key: "rg", value: "1234567-8", on: true, toggle_key: 'r' },
];

type IState = typeof INIT_STATE

function format_on(on: boolean) {
  return on ? '**' : '_'
}

const template = (s: IState) => {
  let out = ''
  for (let v of s) {
    out += `${v.toggle_key}		${format_on(v.on)}${variable_line_template(v)}${format_on(v.on)}\n\n`
  }
  return out
}
const copy_template = (s: IState) => {
  let out = ''
  for (let v of s.filter((v) => v.on)) {
    out += variable_line_template(v) + '\n'
  }
  return out

}


  export default function Command() {
  const prefs = getPreferenceValues<{variables: string}>();
  let init_state = INIT_STATE
  if(prefs.variables) {
    const fs = require('node:fs');
    let content = fs.readFileSync(prefs.variables, 'utf8')
    const variables = JSON.parse(content).variables as IVariable[];
    init_state = variables;
  }
  const [vars, set_vars] = useState(init_state)

  function toggle(key: KEYS) {
    set_vars(vars.map((v) => v.key === key ? {...v, on: !v.on} : v));
    let is_on = !vars.filter((v) => v.key === key)[0].on
    showToast({ title: `Toggle ${key}`, message: is_on ? `${key} is currently shown` : `${key} is currently hidden` });
  }
  const actions = vars.map(
    (v) => <Action title={`Toggle ${v.key}`} shortcut={{modifiers: [], key: v.toggle_key}} onAction={() => toggle(v.key)} />
  );

  return (
    <Detail markdown={template(vars)}
      actions={
        <ActionPanel title="Actions">
          <Action.CopyToClipboard content={copy_template(vars)} />
          {...actions}
          <Action shortcut={{modifiers: ["cmd", "shift"], key: ","}} title="Open Extension Preferences" onAction={openCommandPreferences} />
        </ActionPanel>
      }
    />
  )
}

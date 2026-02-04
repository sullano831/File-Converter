import { useState, useEffect } from 'react'
import { bootstrapTemplate, BOOTSTRAP_FORM_PLACEHOLDER, FORM_NAME_PLACEHOLDER, POST_NAME_KEY_PLACEHOLDER } from './templates/bootstrapTemplate'
import { version2_3_non_mvcTemplate, V2_3_FORM_PLACEHOLDER, V2_3_VALIDATION_PLACEHOLDER } from './templates/version2_3_non_mvcTemplate'
import { version3_mvcTemplate, V3_FORM_PLACEHOLDER, V3_VALIDATION_PLACEHOLDER } from './templates/version3_mvcTemplate'
import { modernFormsTemplate, MODERN_FORMS_FORM_PLACEHOLDER, MODERN_FORMS_VALIDATION_PLACEHOLDER } from './templates/modernFormsTemplate'
import './App.css'

const VERSIONS = {
  bootstrap: 'Bootstrap',
  version2_3_non_mvc: 'Version 2 - 3 Non MVC',
  version3_mvc: 'Version 3 MVC',
  modern_forms: 'Modern Forms',
}

const HISTORY_STORAGE_KEY = 'file-converter-download-history'
const HISTORY_MAX_ITEMS = 50
const HIDE_SHOW_PLACEHOLDER = '<!-- INSERT HIDE/SHOW FUNCTIONALITY HERE -->'
const CHECKBOX_VALUES_LINES_PLACEHOLDER = '<!-- CHECKBOX_VALUES_LINES -->'

/** Extract chkboxVal input names from pasted PHP or HTML. PHP: (label, array, name), name is 3rd arg; if empty use 1st. HTML fallback: name="...[]" on checkboxes. */
const getChkboxValNames = (code) => {
  if (!code || !code.trim()) return []
  const names = []
  const phpRe = /\$input\s*->\s*chkboxVal\s*\(\s*['"]([^'"]*)['"]\s*,\s*array\s*\(([^)]*)\)\s*,\s*['"]([^'"]*)['"]/g
  let m
  while ((m = phpRe.exec(code)) !== null) {
    const first = m[1] != null ? String(m[1]).trim() : ''
    const third = m[3] != null ? String(m[3]).trim() : ''
    const name = third !== '' ? third : first
    if (name !== '') names.push(name)
  }
  if (names.length > 0) return names
  const htmlRe = /<input[^>]*\sname\s*=\s*['"]([^'"]+)\[\]['"][^>]*type\s*=\s*['"]checkbox['"]|type\s*=\s*['"]checkbox['"][^>]*\sname\s*=\s*['"]([^'"]+)\[\]['"]/gi
  while ((m = htmlRe.exec(code)) !== null) {
    const n = (m[1] || m[2] || '').trim()
    if (n !== '' && !names.includes(n)) names.push(n)
  }
  return names
}

/** Escape for use inside a JS single-quoted string */
const escapeJsString = (s) => (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")

export default function App() {
  const [activeVersion, setActiveVersion] = useState('bootstrap')
  const [fileName, setFileName] = useState('')
  const [formName, setFormName] = useState('')
  const [nameField, setNameField] = useState('')
  const [codeToPaste, setCodeToPaste] = useState('')
  const [formValidationCode, setFormValidationCode] = useState('')
  const [hideShowCode, setHideShowCode] = useState('')
  const [downloadConfirm, setDownloadConfirm] = useState(null) // { fileName, content }
  const [showPasteCodePrompt, setShowPasteCodePrompt] = useState(false)
  const [showRequiredFieldsPrompt, setShowRequiredFieldsPrompt] = useState(false)
  const [viewCodeItem, setViewCodeItem] = useState(null) // history item for View Code modal
  const [removeConfirmItem, setRemoveConfirmItem] = useState(null) // history item for single remove confirmation
  const [removeConfirmIds, setRemoveConfirmIds] = useState(null) // array of ids for bulk remove confirmation
  const [selectedHistoryIds, setSelectedHistoryIds] = useState([]) // ids selected for bulk remove
  const [hideShowInsertModal, setHideShowInsertModal] = useState(null) // { type: 'radio'|'select'|'checkbox', count: 1 }
  const [activeTab, setActiveTab] = useState('converter') // 'converter' | 'history'
  const [downloadHistory, setDownloadHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      const toStore = downloadHistory.slice(-HISTORY_MAX_ITEMS)
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(toStore))
    } catch {
      // ignore quota or parse errors
    }
  }, [downloadHistory])

  const showValidationInput =
    activeVersion === 'version2_3_non_mvc' || activeVersion === 'version3_mvc' || activeVersion === 'modern_forms'

  const handleVersionChange = (nextVersion) => {
    setActiveVersion(nextVersion)
    // Bootstrap template does not use form validation; clear any leftover text
    if (nextVersion === 'bootstrap') setFormValidationCode('')
  }

  const escapePhpString = (s) => (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")

  const handleCreateFile = () => {
    if (!codeToPaste.trim()) {
      setShowPasteCodePrompt(true)
      return
    }
    if (!fileName.trim() || !formName.trim() || !nameField.trim()) {
      setShowRequiredFieldsPrompt(true)
      return
    }
    let content
    if (activeVersion === 'bootstrap') {
      content = bootstrapTemplate
        .replace(BOOTSTRAP_FORM_PLACEHOLDER, codeToPaste.trim())
        .replace(FORM_NAME_PLACEHOLDER, escapePhpString(formName.trim() || 'Set an Appointment Form'))
        .replace(new RegExp(POST_NAME_KEY_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), escapePhpString(nameField.trim() || 'Name'))
    } else if (activeVersion === 'version2_3_non_mvc') {
      content = version2_3_non_mvcTemplate
        .replace(V2_3_FORM_PLACEHOLDER, codeToPaste.trim())
        .replace(FORM_NAME_PLACEHOLDER, escapePhpString(formName.trim() || 'Set an Appointment Form'))
        .replace(new RegExp(POST_NAME_KEY_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), escapePhpString(nameField.trim() || 'Name'))
        .replace(V2_3_VALIDATION_PLACEHOLDER, formValidationCode.trim() || V2_3_VALIDATION_PLACEHOLDER)
    } else if (activeVersion === 'version3_mvc') {
      content = version3_mvcTemplate
        .replace(V3_FORM_PLACEHOLDER, codeToPaste.trim())
        .replace(FORM_NAME_PLACEHOLDER, escapePhpString(formName.trim() || 'Set an Appointment Form'))
        .replace(new RegExp(POST_NAME_KEY_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), escapePhpString(nameField.trim() || 'Name'))
        .replace(V3_VALIDATION_PLACEHOLDER, formValidationCode.trim() || V3_VALIDATION_PLACEHOLDER)
    } else if (activeVersion === 'modern_forms') {
      content = modernFormsTemplate
        .replace(MODERN_FORMS_FORM_PLACEHOLDER, codeToPaste.trim())
        .replace(FORM_NAME_PLACEHOLDER, escapePhpString(formName.trim() || 'Set an Appointment Form'))
        .replace(new RegExp(POST_NAME_KEY_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), escapePhpString(nameField.trim() || 'Name'))
        .replace(MODERN_FORMS_VALIDATION_PLACEHOLDER, formValidationCode.trim() || MODERN_FORMS_VALIDATION_PLACEHOLDER)
    } else {
      const parts = [codeToPaste]
      if (formValidationCode.trim()) parts.push(formValidationCode.trim())
      if (hideShowCode.trim()) parts.push(hideShowCode.trim())
      content = parts.join('\n\n')
    }
    if (activeVersion === 'bootstrap' || activeVersion === 'version2_3_non_mvc' || activeVersion === 'version3_mvc' || activeVersion === 'modern_forms') {
      content = content.replace(HIDE_SHOW_PLACEHOLDER, hideShowCode.trim() || HIDE_SHOW_PLACEHOLDER)
    }
    if (activeVersion === 'version2_3_non_mvc' || activeVersion === 'version3_mvc' || activeVersion === 'modern_forms') {
      const chkboxNames = getChkboxValNames(codeToPaste)
      const checkboxLines = chkboxNames.length > 0
        ? chkboxNames.map((name) => `\t\t\t\tcheckboxValues('${escapeJsString(name)}');`).join('\n')
        : "\t\t\t\tcheckboxValues('<!-- CHECKBOX_NAME_1 -->');"
      content = content.replace(CHECKBOX_VALUES_LINES_PLACEHOLDER, checkboxLines)
    }
    const downloadFileName = ((activeVersion === 'bootstrap' || activeVersion === 'version2_3_non_mvc' || activeVersion === 'version3_mvc' || activeVersion === 'modern_forms') && fileName.trim())
      ? (fileName.trim().endsWith('.php') ? fileName.trim() : fileName.trim() + '.php')
      : `form-${activeVersion}.php`
    setDownloadConfirm({ fileName: downloadFileName, content })
  }

  const handleDownloadConfirm = () => {
    if (!downloadConfirm) return
    setDownloadHistory((prev) => {
      const entry = {
        id: Date.now(),
        fileName: downloadConfirm.fileName,
        content: downloadConfirm.content,
        formName,
        nameField,
        formValidationCode,
        hideShowCode,
        activeVersion,
        codeToPaste,
        timestamp: new Date().toISOString(),
      }
      return [...prev, entry].slice(-HISTORY_MAX_ITEMS)
    })
    const blob = new Blob([downloadConfirm.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = downloadConfirm.fileName
    a.click()
    URL.revokeObjectURL(url)
    setDownloadConfirm(null)
  }

  const handleDownloadCancel = () => {
    setDownloadConfirm(null)
  }

  const handleHistoryDownload = (item) => {
    const blob = new Blob([item.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = item.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleHistoryLoad = (item) => {
    setFileName(item.fileName.replace(/\.php$/i, '') || item.fileName)
    setFormName(item.formName || '')
    setNameField(item.nameField || '')
    setCodeToPaste(item.codeToPaste || '')
    setFormValidationCode(item.formValidationCode || '')
    setHideShowCode(item.hideShowCode || '')
    setActiveVersion(item.activeVersion || 'bootstrap')
    setActiveTab('converter')
  }

  const handleHistoryRemoveConfirm = () => {
    if (!removeConfirmItem) return
    setDownloadHistory((prev) => prev.filter((e) => e.id !== removeConfirmItem.id))
    setRemoveConfirmItem(null)
    setSelectedHistoryIds((prev) => prev.filter((id) => id !== removeConfirmItem.id))
  }

  const handleHistoryRemoveCancel = () => {
    setRemoveConfirmItem(null)
  }

  const handleHistoryToggleSelect = (id) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleHistorySelectAll = () => {
    setSelectedHistoryIds(downloadHistory.map((e) => e.id))
  }

  const handleHistoryDeselectAll = () => {
    setSelectedHistoryIds([])
  }

  const handleHistoryRemoveSelectedConfirm = () => {
    if (!removeConfirmIds || removeConfirmIds.length === 0) return
    setDownloadHistory((prev) => prev.filter((e) => !removeConfirmIds.includes(e.id)))
    setRemoveConfirmIds(null)
    setSelectedHistoryIds([])
  }

  const handleHistoryRemoveSelectedCancel = () => {
    setRemoveConfirmIds(null)
  }

  /** Generate hide/show snippets for insertion (format from spec). */
  const getHideShowRadioSnippet = (index) => {
    const n = index + 1
    const containerId = `ifOther${n}`
    const fieldName = `Field_Name_${n}`
    return `\t//  hide/show function radio ${n}\n\t$('#${containerId}').hide();\n\t$("input[name='${fieldName}']").change(function(){\n\t  if($(this).val() == "Other"){\n\t    $("#${containerId}").slideDown();\n\t    $("#${containerId}").find(':input').attr('disabled', false);\n\t  }else{\n\t    $("#${containerId}").slideUp();\n\t    $("#${containerId}").find(':input').attr('disabled', 'disabled');\n\t  }\n\t});\n`
  }

  const getHideShowSelectSnippet = (index) => {
    const n = index + 1
    const containerId = `ifOther${n}`
    const fieldName = `Field_Name_${n}`
    return `\t//  hide/show function select/dropdown ${n}\n\t$('#${containerId}').hide();\n\t$("#${fieldName}").change(function(){\n\t  if($(this).val() == "Other"){\n\t    $("#${containerId}").slideDown();\n\t    $("#${containerId}").find(':input').attr('disabled', false);\n\t  }else{\n\t    $("#${containerId}").slideUp();\n\t    $("#${containerId}").find(':input').attr('disabled', 'disabled');\n\t  }\n\t});\n`
  }

  const getHideShowCheckboxSnippet = (index) => {
    const n = index + 1
    const containerId = `ifOther${n}`
    const checkboxName = `Checkbox_Name_${n}`
    return `\t//  hide/show function checkbox ${n}\n\t$("#${containerId}").hide();\n\t$("#${checkboxName}").change(function(){\n\t  if($(this).is(':checked')){\n\t    $("#${containerId}").slideDown();\n\t    $("#${containerId}").find(':input').attr('disabled', false);\n\t  }else{\n\t    $("#${containerId}").slideUp();\n\t    $("#${containerId}").find(':input').attr('disabled', 'disabled');\n\t  }\n\t});\n`
  }

  const handleHideShowInsert = () => {
    if (!hideShowInsertModal) return
    const count = Math.min(20, Math.max(1, parseInt(String(hideShowInsertModal.count), 10) || 1))
    const type = hideShowInsertModal.type
    let blocks = []
    for (let i = 0; i < count; i++) {
      if (type === 'radio') blocks.push(getHideShowRadioSnippet(i))
      else if (type === 'select') blocks.push(getHideShowSelectSnippet(i))
      else if (type === 'checkbox') blocks.push(getHideShowCheckboxSnippet(i))
    }
    const insert = (hideShowCode.trim() ? '\n\n' : '') + blocks.join('\n')
    setHideShowCode((prev) => prev.trim() + insert)
    setHideShowInsertModal(null)
  }

  const formatHistoryDate = (iso) => {
    try {
      const d = new Date(iso)
      return isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  const labelDisplay = (text) => escapeHtml((text || '').replace(/_/g, ' '))

  const extractArrayOptions = (str) => {
    if (!str || !str.trim()) return []
    const opts = []
    const re = /['"]([^'"]*)['"]/g
    let m
    while ((m = re.exec(str)) !== null) opts.push(m[1])
    return opts
  }

  const parseColumnPhp = (phpContent) => {
    const parts = []
    const fieldRegex = /fields\s*\(\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*\)/g
    const radioRegex = /\$input\s*->\s*radio\s*\(\s*['"]([^'"]*)['"]\s*,\s*(?:array\s*\(([^)]*)\)|['"]([^'"]*)['"])/g
    const labelRegex = /\$input\s*->\s*label\s*\(\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*\)/g
    const selectRegex = /\$input\s*->\s*select\s*\(\s*['"]([^'"]*)['"]\s*,\s*array\s*\(([^)]*)\)\s*,\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*\)/g
    const chkboxRegex = /\$input\s*->\s*chkboxVal\s*\(\s*['"]([^'"]*)['"]\s*,\s*array\s*\(([^)]*)\)\s*,\s*['"]([^'"]*)['"]/g
    const textareaRegex = /\$input\s*->\s*textarea\s*\(\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,[^)]*['"]([^'"]*)['"]\s*\)/g
    const matches = []
    let m
    const addMatch = (type, regex) => {
      regex.lastIndex = 0
      while ((m = regex.exec(phpContent)) !== null) matches.push({ index: m.index, type, m })
    }
    addMatch('fields', fieldRegex)
    addMatch('radio', radioRegex)
    addMatch('label', labelRegex)
    addMatch('select', selectRegex)
    addMatch('chkboxVal', chkboxRegex)
    addMatch('textarea', textareaRegex)
    matches.sort((a, b) => a.index - b.index)
    let fieldId = 0
    for (const { type, m } of matches) {
      if (type === 'label') {
        const [, labelText] = m
        parts.push(`<div class="mb-3"><label class="form-label">${labelDisplay(labelText)}</label>`)
      } else if (type === 'radio') {
        const [, name, arrayInner, singleOpt] = m
        const options = arrayInner != null ? extractArrayOptions(arrayInner) : (singleOpt ? [singleOpt] : ['Option'])
        const prev = parts[parts.length - 1]
        const labelOpen = prev && prev.endsWith('</label>') && !prev.includes('</div>')
        const radios = options.map((opt) => {
          const id = (name + '_' + opt).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '_' + fieldId++
          return `<div class="form-check"><input type="radio" class="form-check-input" id="${id}" name="${escapeHtml(name)}" value="${escapeHtml(opt)}" disabled /><label class="form-check-label" for="${id}">${escapeHtml(opt)}</label></div>`
        }).join('')
        parts.push(`${labelOpen ? '' : '<div class="mb-3">'}<div class="mb-2">${radios}</div></div>`)
      } else if (type === 'fields') {
        const [, label, className, name, value] = m
        const id = (name || 'f').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '_' + fieldId++
        const inputClass = className ? `form-control ${escapeHtml(className)}` : 'form-control'
        parts.push(`<div class="mb-3"><label for="${id}" class="form-label">${labelDisplay(label || name)}</label><input type="text" class="${inputClass}" id="${id}" name="${escapeHtml(name)}" value="${escapeHtml(value)}" disabled /></div>`)
      } else if (type === 'select') {
        const [, label, arrayInner, name] = m
        const options = extractArrayOptions(arrayInner)
        const id = (name || 's').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '_' + fieldId++
        const optsHtml = options.map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')
        parts.push(`<div class="mb-3"><label for="${id}" class="form-label">${labelDisplay(label || name)}</label><select class="form-select" id="${id}" name="${escapeHtml(name)}" disabled><option value="">Select...</option>${optsHtml}</select></div>`)
      } else if (type === 'chkboxVal') {
        const [, label, arrayInner, name] = m
        const options = extractArrayOptions(arrayInner)
        const prev = parts[parts.length - 1]
        const labelOpen = prev && prev.endsWith('</label>') && !prev.includes('</div>')
        const boxes = options.map((opt) => {
          const id = (name + '_' + opt).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '_' + fieldId++
          return `<div class="form-check"><input type="checkbox" class="form-check-input" id="${id}" name="${escapeHtml(name)}[]" value="${escapeHtml(opt)}" disabled /><label class="form-check-label" for="${id}">${escapeHtml(opt)}</label></div>`
        }).join('')
        parts.push(`${labelOpen ? '' : '<div class="mb-3">'}<div class="mb-2">${boxes}</div></div>`)
      } else if (type === 'textarea') {
        const [, name, className, idVal, placeholder] = m
        const id = (idVal || name || 't').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '_' + fieldId++
        const textareaClass = className ? `form-control ${escapeHtml(className)}` : 'form-control'
        parts.push(`<div class="mb-3"><label for="${id}" class="form-label">${labelDisplay(name)}</label><textarea class="${textareaClass}" id="${id}" name="${escapeHtml(name)}" rows="4" placeholder="${escapeHtml(placeholder || '')}" disabled></textarea></div>`)
      }
    }
    return parts.join('')
  }

  const parseNonRowContent = (html) => {
    const out = []
    const fieldheaderMatch = html.match(/<p\s+class="[^"]*fieldheader[^"]*"[^>]*>([^<]*)<\/p>\s*<input[^>]*type="hidden"[^>]*name="([^"]*)"[^>]*>/i)
    if (fieldheaderMatch) {
      const [, title, name] = fieldheaderMatch
      out.push(`<p class="fieldheader text-center text-uppercase fw-bold py-2 mb-3">${escapeHtml((title || '').trim())}</p>`)
      out.push(`<input type="hidden" name="${escapeHtml(name)}" value=":" />`)
    }
    const disclaimerMatch = html.match(/<div\s+class="disclaimer"[^>]*>([\s\S]*?)<\/div>/i)
    if (disclaimerMatch) {
      out.push(renderDisclaimerBlock(disclaimerMatch[1]))
    }
    return out.join('')
  }

  const renderDisclaimerBlock = (innerHtml) => {
    const nameMatch = innerHtml.match(/<input[^>]*name=["']([^"']+)["']/i)
    const name = nameMatch ? nameMatch[1] : 'disclaimer'
    const id = (name || 'disclaimer').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
    const bMatch = innerHtml.match(/<b>([\s\S]*?)<\/b>/i)
    let label = bMatch ? bMatch[1].replace(/&nbsp;/gi, ' ').trim() : 'Disclaimer'
    if (!label) label = 'Disclaimer'
    return `<div class="form-check mb-3 mt-3"><input type="checkbox" class="form-check-input" id="${escapeHtml(id)}" name="${escapeHtml(name)}" disabled /><label class="form-check-label" for="${escapeHtml(id)}">${escapeHtml(label)}</label></div>`
  }

  const phpToPreviewHtml = (code) => {
    const rowParts = code.split(/<div class="row(?:\s|")/g)
    const preContent = parseNonRowContent(rowParts[0] || '')
    const rows = []
    for (let i = 1; i < rowParts.length; i++) {
      const rowBlock = rowParts[i]
      const colRegex = /<div class=["']col-md-(\d+)\s*["'][^>]*>([\s\S]*?)<\/div>/g
      const cols = []
      let colM
      while ((colM = colRegex.exec(rowBlock)) !== null) {
        const colSize = colM[1]
        const phpContent = colM[2].trim()
        const colHtml = parseColumnPhp(phpContent)
        if (colHtml) cols.push({ size: colSize, html: colHtml })
      }
      if (cols.length > 0) {
        rows.push({ type: 'row', html: cols.map((c) => `<div class="col-md-${c.size}">${c.html}</div>`).join('') })
      }
      const disclaimerInRow = rowBlock.match(/<div\s+class="disclaimer"[^>]*>([\s\S]*?)<\/div>/i)
      if (disclaimerInRow) {
        rows.push({ type: 'disclaimer', html: renderDisclaimerBlock(disclaimerInRow[1]) })
      }
    }
    if (rows.length > 0) {
      const rowsHtml = rows.map((r) => r.type === 'row' ? `<div class="row g-3 mb-3">${r.html}</div>` : r.html).join('\n')
      return preContent ? preContent + '\n' + rowsHtml : rowsHtml
    }
    const fields = []
    const fieldRegex = /fields\s*\(\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*\)/g
    const radioRegex = /\$input\s*->\s*radio\s*\(\s*['"]([^'"]*)['"]\s*,\s*(?:array\s*\(\s*['"]([^'"]*)['"]\s*\)|['"]([^'"]*)['"])/g
    let m
    fieldRegex.lastIndex = 0
    while ((m = fieldRegex.exec(code)) !== null) {
      const [, label, className, name, value] = m
      const id = (name || 'f').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '_' + fields.length
      const inputClass = className ? `form-control ${escapeHtml(className)}` : 'form-control'
      fields.push(`<div class="mb-3"><label for="${id}" class="form-label">${labelDisplay(label || name)}</label><input type="text" class="${inputClass}" id="${id}" name="${escapeHtml(name)}" value="${escapeHtml(value)}" disabled /></div>`)
    }
    radioRegex.lastIndex = 0
    while ((m = radioRegex.exec(code)) !== null) {
      const [, name, optFromArray, optFromStr] = m
      const optionLabel = optFromArray || optFromStr || 'Option'
      const id = (name + '_' + optionLabel).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '_' + fields.length
      fields.push(`<div class="mb-3"><label class="form-label">${labelDisplay(name)}</label><div class="form-check"><input type="radio" class="form-check-input" id="${id}" name="${escapeHtml(name)}" value="${escapeHtml(optionLabel)}" disabled /><label class="form-check-label" for="${id}">${escapeHtml(optionLabel)}</label></div></div>`)
    }
    if (fields.length === 0) return null
    const colMatch = code.match(/col-(?:md-|lg-|sm-)?(\d+)/g)
    const columnsPerRow = colMatch ? Math.floor(12 / Math.min(...colMatch.map((s) => parseInt(s.replace(/\D/g, ''), 10)).filter((n) => n > 0 && n <= 12))) : 1
    if (columnsPerRow <= 1) return fields.join('\n')
    const colSize = Math.floor(12 / columnsPerRow)
    const outRows = []
    for (let i = 0; i < fields.length; i += columnsPerRow) {
      const rowFields = fields.slice(i, i + columnsPerRow)
      const cols = rowFields.map((f) => `<div class="col-md-${colSize}">${f}</div>`).join('')
      outRows.push(`<div class="row g-3 mb-3">${cols}</div>`)
    }
    return outRows.join('\n')
  }

  const escapeHtml = (s) => {
    if (s == null) return ''
    const str = String(s)
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  const getPreviewHtml = () => {
    const raw = codeToPaste.trim()
    const displayFormName = formName.trim() || 'Set an Appointment Form'
    const isPhp = /\$input\s*->|fields\s*\(/.test(raw)
    const formFieldsHtml = isPhp ? (phpToPreviewHtml(raw) || raw) : raw
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${displayFormName}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
    .form-control, .form-select, input[type="text"], select.form-select, textarea.form-control { width: 100%; box-sizing: border-box; }
    .col-md-6 .mb-3, .col-md-12 .mb-3 { width: 100%; }
  </style>
</head>
<body>
  <div class="container my-5">
    <form id="submitform" name="contact" method="post" enctype="multipart/form-data" action="" novalidate class="needs-validation">
      <div class="alert alert-info mb-4" role="alert">
        <strong>Preview</strong> – This is how your form will look. Form submission is disabled.
      </div>
      ${formFieldsHtml}
      <div class="form-check mb-3 mt-3">
        <input type="checkbox" class="form-check-input" id="Privacy_Policy" name="Privacy_Policy" required disabled>
        <label class="form-check-label" for="Privacy_Policy">I consent to the collection, use, storage, and processing of my personal and, where applicable, health-related information, including any data I submit on behalf of others, for the purpose of evaluating or fulfilling my request made through this form. I understand this will be handled in accordance with the <a href="/privacy-notice" target="_blank">Privacy Notice</a>.</label>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-12">
          <div class="form-group">
            <div class="border rounded p-3 bg-light text-muted small">reCAPTCHA will appear here on the live form.</div>
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-primary w-100 mt-3" disabled>Submit <i class="fas fa-angle-double-right"></i></button>
    </form>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"><\/script>
</body>
</html>`
  }

  const handleClearAll = () => {
    setFileName('')
    setFormName('')
    setNameField('')
    setCodeToPaste('')
    setFormValidationCode('')
    setHideShowCode('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PHP File Converter</h1>
      </header>

      <div className="app-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'converter' ? 'active' : ''}`}
          onClick={() => setActiveTab('converter')}
        >
          Converter
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
          {downloadHistory.length > 0 && (
            <span className="tab-badge">{downloadHistory.length}</span>
          )}
        </button>
      </div>

      <main className="app-main">
        {activeTab === 'converter' && (
        <div className="app-main-grid">
          <section className="version-section">
            <h2 className="section-title">Select version</h2>
            <div className="version-buttons">
              <button
                type="button"
                className={`version-btn ${activeVersion === 'bootstrap' ? 'active' : ''}`}
                onClick={() => handleVersionChange('bootstrap')}
              >
                {VERSIONS.bootstrap}
              </button>
              <button
                type="button"
                className={`version-btn ${activeVersion === 'version2_3_non_mvc' ? 'active' : ''}`}
                onClick={() => handleVersionChange('version2_3_non_mvc')}
              >
                {VERSIONS.version2_3_non_mvc}
              </button>
              <button
                type="button"
                className={`version-btn ${activeVersion === 'version3_mvc' ? 'active' : ''}`}
                onClick={() => handleVersionChange('version3_mvc')}
              >
                {VERSIONS.version3_mvc}
              </button>
              <button
                type="button"
                className={`version-btn ${activeVersion === 'modern_forms' ? 'active' : ''}`}
                onClick={() => handleVersionChange('modern_forms')}
              >
                {VERSIONS.modern_forms}
              </button>
            </div>

            <div className="input-group" style={{ marginTop: '1.25rem' }}>
              <label htmlFor="file-name" className="label-required">File Name</label>
              <input
                id="file-name"
                type="text"
                className="input-textarea"
                placeholder="e.g. appointment-form (.php is added)"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
                aria-required="true"
                style={{ minHeight: 'auto', padding: '0.5rem 0.75rem' }}
              />
            </div>
            <div className="input-group">
              <label htmlFor="form-name" className="label-required">Form Name</label>
              <input
                id="form-name"
                type="text"
                className="input-textarea"
                placeholder="Set an Appointment Form"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                aria-required="true"
                style={{ minHeight: 'auto', padding: '0.5rem 0.75rem' }}
              />
            </div>
            <div className="input-group">
              <label htmlFor="name-field" className="label-required">Name (POST key)</label>
              <input
                id="name-field"
                type="text"
                className="input-textarea"
                placeholder="Name"
                value={nameField}
                onChange={(e) => setNameField(e.target.value)}
                required
                aria-required="true"
                style={{ minHeight: 'auto', padding: '0.5rem 0.75rem' }}
              />
            </div>

            <section className="actions-section" style={{ marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-primary" onClick={handleCreateFile}>
                Create a file
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClearAll}>
                Clear all
              </button>
            </section>
          </section>

          <div className="converter-bottom-container">
            <div className={`converter-bottom-row ${showValidationInput ? '' : 'converter-bottom-row--two-cols'}`}>
              <section className="inputs-section">
                <div className="input-group">
                  <label htmlFor="code-to-paste">HTML Code(s)</label>
                  <textarea
                    id="code-to-paste"
                    className="input-textarea textarea-tall"
                    placeholder="Paste your code from the converter here..."
                    value={codeToPaste}
                    onChange={(e) => setCodeToPaste(e.target.value)}
                    rows={18}
                  />
                </div>
              </section>

              {showValidationInput && (
                <section className="inputs-section">
                  <div className="input-group">
                    <label htmlFor="form-validation-code">Form Validation</label>
                    <textarea
                      id="form-validation-code"
                      className="input-textarea textarea-tall"
                      placeholder="Paste form validation code here..."
                      value={formValidationCode}
                      onChange={(e) => setFormValidationCode(e.target.value)}
                      rows={18}
                    />
                  </div>
                </section>
              )}

              <section className="inputs-section">
                <div className="input-group">
                  <label htmlFor="hide-show-code">Hide/Show Functionality</label>
                  <div className="hide-show-buttons">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setHideShowInsertModal({ type: 'radio', count: '1' })}
                    >
                      Add Radio
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setHideShowInsertModal({ type: 'select', count: '1' })}
                    >
                      Add Select
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setHideShowInsertModal({ type: 'checkbox', count: '1' })}
                    >
                      Add Checkbox
                    </button>
                  </div>
                  <textarea
                    id="hide-show-code"
                    className="input-textarea textarea-tall"
                    placeholder="Paste hide/show functionality code here..."
                    value={hideShowCode}
                    onChange={(e) => setHideShowCode(e.target.value)}
                    rows={18}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'history' && (
          <section className="history-section">
            <h2 className="section-title">Download history</h2>
            {downloadHistory.length === 0 ? (
              <p className="history-empty">No downloads yet. Create a file to see it here.</p>
            ) : (
              <>
                <div className="history-toolbar">
                  <button type="button" className="btn-link-sm" onClick={handleHistorySelectAll}>
                    Select all
                  </button>
                  <button type="button" className="btn-link-sm" onClick={handleHistoryDeselectAll}>
                    Deselect all
                  </button>
                  {selectedHistoryIds.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setRemoveConfirmIds([...selectedHistoryIds])}
                    >
                      Remove selected ({selectedHistoryIds.length})
                    </button>
                  )}
                </div>
                <ul className="history-list">
                  {[...downloadHistory].reverse().map((item) => (
                    <li key={item.id} className="history-item">
                      <label className="history-item-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedHistoryIds.includes(item.id)}
                          onChange={() => handleHistoryToggleSelect(item.id)}
                        />
                      </label>
                      <div className="history-item-info">
                        <span className="history-item-name">{item.fileName}</span>
                        <span className="history-item-version">{VERSIONS[item.activeVersion] ?? item.activeVersion ?? 'Bootstrap'}</span>
                        <span className="history-item-date">{formatHistoryDate(item.timestamp)}</span>
                      </div>
                      <div className="history-item-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleHistoryDownload(item)}
                        >
                          Download again
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewCodeItem(item)}
                        >
                          View Code
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setRemoveConfirmItem(item)}
                          title="Remove from history"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </main>

      {downloadConfirm && (
        <div className="modal-overlay" onClick={handleDownloadCancel}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="modal-message">
              Do you want to download &quot;{downloadConfirm.fileName}&quot;?
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={handleDownloadConfirm}>
                Download
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleDownloadCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasteCodePrompt && (
        <div className="modal-overlay" onClick={() => setShowPasteCodePrompt(false)}>
          <div className="modal-dialog prompt-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="prompt-title">Code required</h3>
            <p className="modal-message">
              Please paste your HTML or PHP code in the <strong>HTML Code(s)</strong> field before creating a file.
            </p>
            <div className="modal-actions modal-actions--center">
              <button type="button" className="btn btn-primary" onClick={() => setShowPasteCodePrompt(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {hideShowInsertModal && (
        <div className="modal-overlay" onClick={() => setHideShowInsertModal(null)}>
          <div className="modal-dialog prompt-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="prompt-title">
              Add {hideShowInsertModal.type === 'radio' ? 'Radio' : hideShowInsertModal.type === 'select' ? 'Select' : 'Checkbox'} hide/show
            </h3>
            <p className="modal-message">How many hide/show functions do you need?</p>
            <div className="hide-show-modal-input-wrap">
              <input
                type="number"
                min={1}
                max={20}
                value={hideShowInsertModal.count}
                onChange={(e) => setHideShowInsertModal((prev) => ({ ...prev, count: e.target.value }))}
                className="input-textarea"
                style={{ minHeight: 'auto', padding: '0.5rem 0.75rem', width: '6rem' }}
              />
            </div>
            <div className="modal-actions modal-actions--center">
              <button type="button" className="btn btn-primary" onClick={handleHideShowInsert}>
                Insert
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setHideShowInsertModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {removeConfirmItem && (
        <div className="modal-overlay" onClick={handleHistoryRemoveCancel}>
          <div className="modal-dialog prompt-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="prompt-title">Remove from history</h3>
            <p className="modal-message">
              Do you want to remove &quot;{removeConfirmItem.fileName}&quot; from history?
            </p>
            <div className="modal-actions modal-actions--center">
              <button type="button" className="btn btn-primary" onClick={handleHistoryRemoveConfirm}>
                Remove
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleHistoryRemoveCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {removeConfirmIds && removeConfirmIds.length > 0 && (
        <div className="modal-overlay" onClick={handleHistoryRemoveSelectedCancel}>
          <div className="modal-dialog prompt-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="prompt-title">Remove from history</h3>
            <p className="modal-message">
              Do you want to remove {removeConfirmIds.length} item(s) from history?
            </p>
            <div className="modal-actions modal-actions--center">
              <button type="button" className="btn btn-primary" onClick={handleHistoryRemoveSelectedConfirm}>
                Remove
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleHistoryRemoveSelectedCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequiredFieldsPrompt && (
        <div className="modal-overlay" onClick={() => setShowRequiredFieldsPrompt(false)}>
          <div className="modal-dialog prompt-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="prompt-title">Required fields</h3>
            <p className="modal-message">
              Please fill in <strong>File Name</strong>, <strong>Form Name</strong>, and <strong>Name (POST key)</strong> before creating a file.
            </p>
            <div className="modal-actions modal-actions--center">
              <button type="button" className="btn btn-primary" onClick={() => setShowRequiredFieldsPrompt(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {viewCodeItem && (
        <div className="modal-overlay" onClick={() => setViewCodeItem(null)}>
          <div className="modal-dialog view-code-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="prompt-title">View Code</h3>
            <dl className="view-code-details">
              <div className="view-code-detail">
                <dt>Version</dt>
                <dd>{VERSIONS[viewCodeItem.activeVersion] ?? viewCodeItem.activeVersion ?? 'Bootstrap'}</dd>
              </div>
              <div className="view-code-detail">
                <dt>File name</dt>
                <dd>{viewCodeItem.fileName}</dd>
              </div>
              <div className="view-code-detail">
                <dt>Form name</dt>
                <dd>{viewCodeItem.formName || '—'}</dd>
              </div>
              <div className="view-code-detail">
                <dt>Name (POST key)</dt>
                <dd>{viewCodeItem.nameField || '—'}</dd>
              </div>
              <div className="view-code-detail">
                <dt>Created</dt>
                <dd>{formatHistoryDate(viewCodeItem.timestamp)}</dd>
              </div>
            </dl>
            <div className="view-code-block-wrap">
              <pre className="view-code-block"><code>{viewCodeItem.content}</code></pre>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => { handleHistoryLoad(viewCodeItem); setViewCodeItem(null); }}
              >
                Load into form
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewCodeItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

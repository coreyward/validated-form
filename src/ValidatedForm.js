import React from "react"
import PropTypes from "prop-types"

export const FormContext = React.createContext()

export default class ValidatedForm extends React.Component {
  state = {
    fields: {},
    submitted: false,
  }

  fields = () => Object.entries(this.state.fields)

  addField = ({ name, defaultValue = "", validator }) =>
    this.setState(prevState => ({
      fields: {
        ...prevState.fields,
        [name]: { value: defaultValue, error: null, validator },
      },
    }))

  removeField = name => {
    this.setState(prevState => {
      // eslint-disable-next-line no-unused-vars
      const { [name]: _, ...fields } = prevState.fields
      return { fields }
    })
  }

  validateField = (fieldName, value) => {
    const { validator } = this.state.fields[fieldName]
    if (!validator) return true

    const [isValid, errorMessage] = validator(value)

    if (isValid) {
      this.clearError(fieldName)
    } else {
      this.addError(fieldName, errorMessage)
    }

    return isValid
  }

  validateAll = () =>
    this.fields().reduce((prevValid, [name, data]) => {
      return this.validateField(name, data.value) && prevValid
    }, true)

  addError = (fieldName, message) => {
    this.setState(prevState => ({
      fields: {
        ...prevState.fields,
        [fieldName]: {
          ...prevState.fields[fieldName],
          error: message,
        },
      },
    }))
  }

  hasError = fieldName => !!this.state.fields[fieldName].error

  clearError = fieldName => {
    this.setState(prevState => ({
      fields: {
        ...prevState.fields,
        [fieldName]: {
          ...prevState.fields[fieldName],
          error: null,
        },
      },
    }))
  }

  clearErrors = () =>
    this.setState(prevState => ({
      fields: Object.entries(prevState.fields).reduce(
        (fields, [fieldName, data]) => {
          fields[fieldName] = { ...data, error: null }
          return fields
        },
        {}
      ),
    }))

  handleSubmit = event => {
    if (this.validateAll()) {
      if (this.props.onSubmit) {
        event.preventDefault()

        this.setState({
          submitted: !!this.props.onSubmit({
            event,
            fields: this.state.fields,
            addError: this.addError,
            hasError: this.hasError,
            setField: this.setField,
          }),
        })
      }
    } else {
      event.preventDefault()
      return false
    }
  }

  setField = (name, value) => {
    this.setState(prevState => ({
      fields: {
        ...prevState.fields,
        [name]: {
          ...prevState.fields[name],
          value,
        },
      },
    }))
  }

  handleInputChange = event => {
    const { name, value } = event.target

    this.setField(name, value)

    if (this.hasError(name)) {
      this.validateField(name, value)
    }
  }

  handleInputBlur = event => {
    const { name, value } = event.target
    const { validateEmpty = true } = this.props
    if (!validateEmpty && !value) return
    this.validateField(name, value)
  }

  renderSuccess = () => this.props.renderSuccess || null

  render() {
    if (this.state.submitted) {
      return this.renderSuccess()
    }

    const { children } = this.props
    const context = {
      handleSubmit: this.handleSubmit,
      handleInputChange: this.handleInputChange,
      handleInputBlur: this.handleInputBlur,
      hasError: this.hasError,
      addError: this.addError,
      setField: this.setField,
      addField: this.addField,
      removeField: this.removeField,
      clearError: this.clearError,
      fields: this.state.fields,
    }

    return (
      <FormContext.Provider value={context}>
        <form method="POST" onSubmit={this.handleSubmit} noValidate>
          {typeof children === "function" ? children(context) : children}
        </form>
      </FormContext.Provider>
    )
  }
}

ValidatedForm.propTypes = {
  onSubmit: PropTypes.func,
  renderSuccess: PropTypes.node,
  validateEmpty: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
}

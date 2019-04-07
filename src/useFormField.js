import { useContext, useEffect } from "react"
import PropTypes from "prop-types"
import { FormContext } from "./ValidatedForm"
import validateRequired from "./validators/required"

export const useFormField = ({
  name,
  defaultValue,
  required,
  validator,
  ...fieldProps
}) => {
  const {
    handleInputChange,
    handleInputBlur,
    addField,
    removeField,
    fields: { [name]: field = {} },
  } = useContext(FormContext)

  useEffect(() => {
    addField({
      name,
      defaultValue,
      validator: required
        ? value => validateRequired(value, validator)
        : validator,
    })

    return () => {
      removeField(name)
    }
  }, [addField, removeField, name, validator, required, defaultValue])

  return {
    errorMessage: field.error,
    onChange: handleInputChange,
    onBlur: handleInputBlur,
    value: field.value,
  }
}

useFormField.propTypes = {
  name: PropTypes.string.isRequired,
  defaultValue: PropTypes.string,
  required: PropTypes.bool,
  validator: PropTypes.func,
}

export default useFormField

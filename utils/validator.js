const validateInput = (input) => {
    if (!Array.isArray(input)) {
        return ['input is not an array']
    }

    const errors = []
    input.forEach(file => {
        if (!(file.create || file.update || file.remove)) {
            errors.push('missing operation: ' + JSON.stringify(file))
        }
    })

    return errors.length > 0 ? errors : null
}

const validateCreate = (file) => {
    const errors = []
    if (!file.name) errors.push('missing file name')
    if (typeof file.name !== 'string') errors.push('file name must be a string')
    if (!file.parent && file.parent !== null) errors.push('file parent must be either id or null')
    if (file.folder && file.contents) errors.push('folders can not have contents')
    if (!file.folder && typeof file.contents !== 'string') errors.push('file contents must be a string')

    return errors.length > 0 ? errors.map(error => error + ': ' + JSON.stringify(file)) : null
}

const validateRemove = (file) => {
    const errors = []
    if (!file.id) errors.push('missing file id from update operation')
    if (typeof file.id !== 'number') errors.push('file id must be a number')

    return errors.length > 0 ? errors.map(error => error + ': ' + JSON.stringify(file)) : null
}

const validateUpdate = (file) => {
    const errors = []
    if (!file.id) errors.push('missing file id from update operation')
    if (typeof file.id !== 'number') errors.push('file id must be a number')

    if (file.name !== undefined && typeof file.name !== 'string') errors.push('file name must be a string or undefined')
    if (file.name === '') errors.push('file name can not be empty')

    if (file.parent !== undefined && file.parent !== null && typeof file.parent !== 'number') errors.push('parent must be an id number, null or undefined')
    if (file.parent === 0) errors.push('parent can not be zero')

    if (file.contents !== undefined) {
        if (file.contents !== null && typeof file.contents !== 'string') errors.push('contents must be either null, string or undefined')
        if (file.folder && file.contents !== null) errors.push('folders contents must be null')
        if (!file.folder && typeof file.contents !== 'string') errors.push('file contents must be a string')
    }


    if (!file.name && !file.parent && file.content === undefined) errors.push('there is nothing to update')

    return errors.length > 0 ? errors.map(error => error + ': ' + JSON.stringify(file)) : null
}

const validateFile = (file) => {
    if (file.create) return validateCreate(file)
    if (file.remove) return validateRemove(file)
    if (file.update) return validateUpdate(file)
    return ['missing operation: ' + JSON.stringify(file)]
}


module.exports = {
    validateInput,
    validateFile
}
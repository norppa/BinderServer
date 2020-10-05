const pool = require('../database/pool')

const validateFiles = (files) => {
    try {
        return files
            .map(file => validateFile(file))
            .reduce((acc, cur) => cur !== null ? acc.concat(cur) : acc, [])
    } catch (error) {
        if (error.name === 'TypeError') {
            return ['Expected a list of file objects']
        }
        return [error.message]
    }

}

const validateFile = (file) => {
    const errors = []
    const { name, create, update, remove } = file
    if (!name) errors.push('File name is required: ' + JSON.stringify(file))
    if (!!create + !!update + !!remove !== 1) errors.push('One and only one operation [create|remove|update] is required')
    if (errors.length > 0) return errors
    return null
}

const persist = async (files, site) => {
    const connection = await pool.getConnection()

    const validationErrors = validateFiles(files)
    if (validationErrors.length > 0) return { error: validationErrors }

    try {
        await connection.query('START TRANSACTION')
        let results = []
        for (let i = 0; i < files.length; i++) {
            const result = await persistFile(files[i], site, connection)
            results.push(result)
        }
        await connection.query('COMMIT')
        return results
    } catch (error) {
        console.error('ROLLBACK', error)
        connection.query('ROLLBACK')
        return { error: error.message }
    } finally {
        connection.release()
        connection.destroy()
    }

}

const persistFile = (file, site, connection) => {
    if (file.create) return createFile(file, site, connection)
    if (file.remove) return removeFile(file, site, connection)
    else return updateFile(file, site, connection)
}

const createFile = async (file, site, connection) => {
    const sql = 'INSERT INTO binder_files (name, contents, site) values (?,?,?)'
    const values = [file.name, file.contents, site]
    await connection.query(sql, values)
    return { ...file, site }
}

const updateFile = async (file, site, connection) => {
    const oldFileName = file.update
    const sql = 'UPDATE binder_files SET name = ?, contents = ? WHERE name = ? AND site = ?'
    const values = [file.name, file.contents, oldFileName, site]
    const [rows] = await connection.query(sql, values)
    if (rows.affectedRows === 0) {
        throw new Error('Invalid file name in update request: ' + oldFileName)
    }
    return { ...file }
}

const removeFile = async (file, site, connection) => {
    const sql = 'DELETE FROM binder_files WHERE name = ? AND site = ?'
    values = [file.name, site]
    await connection.query(sql, values)
    return { ...file }
}

// ADMIN TOOLS FOR TESTING ONLY

const getAllFiles = async () => {
    const sql = 'SELECT * FROM binder_files'
    const [rows, fields] = await pool.query(sql)
    return rows
}

const deleteAllFiles = async () => {
    await pool.query('DELETE FROM binder_files')
}

//

module.exports = { persist, getAllFiles, deleteAllFiles }
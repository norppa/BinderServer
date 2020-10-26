const pool = require('../database/pool')
const { validateInput, validateFile } = require('./validator')

const getFiles = async (site) => {
    const sql = 'SELECT id,name,folder,parent FROM binder_files WHERE owner = ?'
    const values = [site]
    const [rows, fields] = await pool.query(sql, values)
    return rows
}

const getFileContents = async (id, site) => {
    const sql = 'SELECT contents from binder_files WHERE id = ? and owner = ?'
    const values = [id, site]
    const [rows, fields] = await pool.query(sql, values)
    return rows[0]
}

const sortFiles = (files) => {
    let removed = [], created = [], updated = []
    // split. if file has more than one tag, priority is remove > create > update
    files.forEach(file => {
        if (file.remove) removed.push(file)
        else if (file.create) created.push(file)
        else if (file.update) updated.push(file)
    })

    // sort removed so that foreign key constraint does not break when deleting
    // we want first the elements that have no children
    const removedSorted = []
    while (removed.length > 0) {
        for (let i = removed.length - 1; i >= 0; i--) {
            if (!removed.some(x => x.parent === removed[i].id)) {
                removedSorted.push(removed.splice(i, 1)[0])
            }
        }
    }

    // sort created in similar fashion
    // this time we want first the elements that have children
    const createdSorted = []
    while (created.length > 0) {
        for (let i = created.length - 1; i >= 0; i--) {
            if (!created.some(x => x.parent === created[i].id)) {
                // created[i] has no children
                createdSorted.unshift(created.splice(i, 1)[0])
            }
        }
    }

    // updated can be in any order
    return [...removedSorted, ...createdSorted, ...updated]
}

const persist = async (files, site) => {
    const errors = validateInput(files)
    if (errors) return { errors }

    files = sortFiles(files)
    const connection = await pool.getConnection()

    try {
        await connection.query('START TRANSACTION')
        let results = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            const errors = validateFile(file)
            if (errors) return { errors }

            let result
            if (file.create) {
                // requests use temporary id's, which need to be mapped to already created row id's
                if (file.parent) {
                    file.parent = results.find(result => result.temporaryId == file.parent).id
                }
                result = file.folder ? await createFolder(file, site, connection) : await createFile(file, site, connection)
            } else if (file.remove) {
                result = await removeFile(file, site, connection)
            } else if (file.update) {
                result = await updateFile(file, site, connection)
            }

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

const createFile = async (file, site, connection) => {
    const { name, parent, contents } = file
    const sql = 'INSERT INTO binder_files (name,folder,parent,contents,owner)  values (?,?,?,?,?)'
    const values = [name, false, parent, contents, site]
    const result = await connection.query(sql, values)
    const id = result[0].insertId
    return { id, name, folder: false, parent, contents, create: true, temporaryId: file.id }
}

const createFolder = async (file, site, connection) => {
    const { name, parent } = file
    const sql = 'INSERT INTO binder_files (name,folder,parent,contents,owner)  values (?,?,?,?,?)'
    const values = [name, true, parent, null, site]
    const result = await connection.query(sql, values)
    const id = result[0].insertId
    return { id, name, folder: true, parent, contents: null, create: true, temporaryId: file.id }
}

const removeFile = async (file, site, connection) => {
    const sql = 'DELETE FROM binder_files WHERE id = ? AND owner = ?'
    values = [file.id, site]
    const result = await connection.query(sql, values)
    return { id: file.id, remove: true }
}

const updateFile = async (file, site, connection) => {
    let sql = 'UPDATE binder_files SET '
    const values = []
    const response = {}
    if (file.name !== undefined) {
        sql = sql + 'name = ?, '
        values.push(file.name)
        response.name = file.name
    }
    if (file.parent !== undefined) {
        sql = sql + 'parent = ?, '
        values.push(file.parent)
        response.parent = file.parent
    }
    if (file.contents !== undefined) {
        sql = sql + 'contents = ?, '
        values.push(file.contents)
        response.contents = file.contents
    }
    sql = sql.substring(0, sql.length - 2) + ' WHERE id = ? AND owner = ?'
    values.push(file.id, site)
    response.id = file.id
    response.update = true

    const [result, error] = await connection.query(sql, values)
    return response

}

module.exports = { persist, getFiles, getFileContents }
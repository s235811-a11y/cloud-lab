import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ studentId: '', name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadStudents = async () => {
    try {
      setError('')
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Không thể tải danh sách sinh viên.')
      setStudents(await response.json())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Không thể thêm sinh viên.')
      setStudents((currentStudents) => [...currentStudents, data])
      setForm({ studentId: '', name: '', email: '' })
      setSuccess('Đã thêm sinh viên thành công.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">QL</div>
        <div>
          <p className="eyebrow">Cloud Lab / Student Registry</p>
          <h1>Quản lý sinh viên</h1>
        </div>
        <div className="api-status"><span /> API online</div>
      </header>

      <section className="content-grid">
        <div className="list-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Danh sách</p>
              <h2>Sinh viên hiện có</h2>
            </div>
            <span className="count-badge">{students.length} bản ghi</span>
          </div>
          {error && <p className="message error">{error}</p>}
          {success && <p className="message success">{success}</p>}
          {loading ? <p className="empty-state">Đang tải dữ liệu...</p> : students.length === 0 ? (
            <p className="empty-state">Chưa có sinh viên nào trong hệ thống.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>MSSV</th><th>Họ tên</th><th>Email</th></tr></thead>
                <tbody>{students.map((student) => (
                  <tr key={student._id || student.studentId}>
                    <td><span className="student-id">{student.studentId}</span></td>
                    <td>{student.name}</td>
                    <td className="email">{student.email}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="form-panel">
          <p className="eyebrow">Cập nhật dữ liệu</p>
          <h2>Thêm sinh viên</h2>
          <p className="form-intro">Tạo một hồ sơ mới trong cơ sở dữ liệu MongoDB.</p>
          <form onSubmit={handleSubmit}>
            <label>Mã số sinh viên<input name="studentId" value={form.studentId} onChange={handleChange} placeholder="VD: 235811" required /></label>
            <label>Họ và tên<input name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn An" required /></label>
            <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="an@example.com" required /></label>
            <button type="submit" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Thêm vào danh sách'} <span>→</span></button>
          </form>
        </aside>
      </section>
      <footer>Connected to <strong>MongoDB Atlas</strong><span>PORT 5000 / API</span></footer>
    </main>
  )
}

export default App

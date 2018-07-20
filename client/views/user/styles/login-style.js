const inputWidth = 300

export default () => {
  return {
    root: {
      padding: '60px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    input: {
      maxWidth: inputWidth,
      width: '60%',
      marginBottom: 20,
    },
    loginButton: {
      maxWidth: inputWidth,
      width: '60%',
      color: '#fff',
    },
  }
}

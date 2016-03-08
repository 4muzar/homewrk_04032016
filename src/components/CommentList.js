import React, { Component, PropTypes } from 'react'
import Comment from './Comment'
import { commentStore } from './../stores'
import toggleOpen from './../HOC/toggleOpen'
import { addComment, loadCommentsByArticleId } from './../actions/comment'

class CommentList extends Component {
    static propTypes = {
        article: PropTypes.object,

        isOpen: PropTypes.bool,
        toggleOpen: PropTypes.func
    };

    state = {
        comment: '',
        loading: true,
        loaded: false
    }

    componentWillUnmount() {
        commentStore.removeChangeListener(this.commentsLoaded)
    }

    render() {
        const { isOpen, toggleOpen } = this.props
        const actionText = isOpen ? 'hide comments' : 'show comments'

        return (
            <div>
                <a href = "#" onClick = {this.toggleOpen}>{actionText}</a>
                {this.getBody()}
            </div>
        )
    }

    getBody() {
        const { article, isOpen } = this.props
        if (!isOpen) return null
        if (this.state.loading) return <h3>Loading comments..</h3>
        const commentList = article.getRelation('comments').map(comment => <li key={comment.id}><Comment comment = {comment}/></li>)
        return (
            <div>                
                <ul>{isOpen ? commentList : null}</ul>
                <input value = {this.state.comment} onChange = {this.commentChange}/>
                <a href = "#" onClick = {this.submitComment}>add comment</a>
            </div>
        )
    }

    commentChange = (ev) => {
        this.setState({
            comment: ev.target.value
        })
    }

    submitComment = (ev) => {
        ev.preventDefault()
        addComment(this.state.comment, this.props.article.id)
        this.setState({
            comment: ''
        })
    }

    toggleOpen = (ev) => {
        ev.preventDefault()

        if (!this.state.isOpen && !this.state.loaded) {
            commentStore.addChangeListener(this.commentsLoaded)
            loadCommentsByArticleId({ id: this.props.article.id})

            this.setState({
                loading: true
            })
        }

        this.props.toggleOpen();
    }

    commentsLoaded = () => {
        this.setState({
            loading: false,
            loaded: true
        })
    };
}

export default toggleOpen(CommentList)